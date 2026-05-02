import crypto from 'crypto';
import { hasDatabase, query, transaction } from '../db/pool.js';
import { memory } from '../db/memory.js';
import { audit } from './audit.js';

export async function getDemoElection() {
  if (hasDatabase) {
    const election = await query("SELECT * FROM demo_elections WHERE status='open' ORDER BY created_at DESC LIMIT 1");
    if (!election.rows[0]) return null;
    const candidates = await query('SELECT * FROM demo_candidates WHERE election_id=$1 ORDER BY name', [election.rows[0].id]);
    return { ...election.rows[0], candidates: candidates.rows };
  }
  return { ...memory.election, candidates: memory.candidates };
}

export async function castDemoVote(user, electionId, candidateId, request) {
  const receipt = `EBH-DEMO-${crypto.randomInt(100000, 999999)}`;
  if (hasDatabase) {
    return transaction(async (client) => {
      const exists = await client.query('SELECT id FROM demo_votes WHERE election_id=$1 AND user_id=$2', [electionId, user.id]);
      if (exists.rows[0]) {
        const error = new Error('Demo vote already cast for this session user');
        error.status = 409;
        throw error;
      }
      const { rows } = await client.query('INSERT INTO demo_votes (election_id,candidate_id,user_id,receipt_no) VALUES ($1,$2,$3,$4) RETURNING *', [electionId, candidateId, user.id, receipt]);
      await audit({ actorId: user.id, action: 'demo_vote.cast', targetType: 'demo_election', targetId: electionId, request, metadata: { receipt } });
      return rows[0];
    });
  }
  if (memory.votes.some((vote) => vote.election_id === electionId && vote.user_id === user.id)) {
    const error = new Error('Demo vote already cast for this session user');
    error.status = 409;
    throw error;
  }
  const vote = { id: crypto.randomUUID(), election_id: electionId, candidate_id: candidateId, user_id: user.id, receipt_no: receipt, created_at: new Date().toISOString() };
  memory.votes.push(vote);
  await audit({ actorId: user.id, action: 'demo_vote.cast', targetType: 'demo_election', targetId: electionId, request, metadata: { receipt } });
  return vote;
}

export async function demoResults(user) {
  if (!['admin', 'operator', 'auditor'].includes(user.role)) {
    const error = new Error('Restricted result view');
    error.status = 403;
    throw error;
  }
  if (hasDatabase) {
    const { rows } = await query('SELECT c.name, c.symbol, count(v.id)::int votes FROM demo_candidates c LEFT JOIN demo_votes v ON v.candidate_id=c.id GROUP BY c.id ORDER BY votes DESC, c.name');
    return rows;
  }
  return memory.candidates.map((candidate) => ({ ...candidate, votes: memory.votes.filter((vote) => vote.candidate_id === candidate.id).length }));
}
