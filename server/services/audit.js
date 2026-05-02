import crypto from 'crypto';
import { hasDatabase, query } from '../db/pool.js';
import { memory } from '../db/memory.js';

export async function audit({ actorId, action, targetType, targetId, request, metadata = {} }) {
  const entry = {
    id: crypto.randomUUID(),
    actor_id: actorId || null,
    action,
    target_type: targetType,
    target_id: targetId || null,
    request_id: request?.id || null,
    ip: request?.ip || null,
    user_agent: request?.headers?.['user-agent'] || null,
    metadata,
    created_at: new Date().toISOString(),
  };
  if (hasDatabase) {
    await query(
      'INSERT INTO audit_logs (actor_id, action, target_type, target_id, request_id, ip, user_agent, metadata) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [entry.actor_id, entry.action, entry.target_type, entry.target_id, entry.request_id, entry.ip, entry.user_agent, entry.metadata]
    );
    return;
  }
  memory.audit.unshift(entry);
}
