import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { castDemoVote, demoResults, getDemoElection } from '../services/evm.js';

const router = Router();
const voteSchema = z.object({ election_id: z.string().uuid(), candidate_id: z.string().uuid() });

router.get('/demo-election', async (_request, response, next) => { try { response.json({ election: await getDemoElection() }); } catch (error) { next(error); } });
router.post('/demo-votes', requireAuth, async (request, response, next) => { try { const body = voteSchema.parse(request.body); response.status(201).json({ vote: await castDemoVote(request.user, body.election_id, body.candidate_id, request) }); } catch (error) { next(error); } });
router.get('/demo-results', requireAuth, async (request, response, next) => { try { response.json({ results: await demoResults(request.user) }); } catch (error) { next(error); } });

export default router;
