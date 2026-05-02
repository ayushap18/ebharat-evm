import crypto from 'crypto';
import { hasDatabase, query } from '../db/pool.js';
import { memory } from '../db/memory.js';
import { createUser, findUserByEmail, sanitizeUser, verifyPassword } from './users.js';
import { hashToken, signAccessToken, signRefreshToken } from '../utils/tokens.js';
import { audit } from './audit.js';

function issueTokens(user) {
  return { accessToken: signAccessToken(user), refreshToken: signRefreshToken(user) };
}

export async function register(payload, request) {
  const user = await createUser(payload);
  await audit({ actorId: user.id, action: 'auth.register', targetType: 'user', targetId: user.id, request });
  return { user: sanitizeUser(user), ...issueTokens(user) };
}

export async function login({ email, password }, request) {
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(user, password))) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }
  const tokens = issueTokens(user);
  const tokenHash = hashToken(tokens.refreshToken);
  if (hasDatabase) {
    await query("INSERT INTO refresh_sessions (user_id, token_hash, expires_at) VALUES ($1,$2,now()+interval '7 days')", [user.id, tokenHash]);
  } else {
    memory.refreshSessions.push({ id: crypto.randomUUID(), user_id: user.id, token_hash: tokenHash, expires_at: Date.now() + 7 * 864e5, revoked_at: null });
  }
  await audit({ actorId: user.id, action: 'auth.login', targetType: 'user', targetId: user.id, request });
  return { user: sanitizeUser(user), ...tokens };
}
