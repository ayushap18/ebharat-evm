import { verifyAccessToken } from '../utils/tokens.js';
import { findUserById } from '../services/users.js';

export async function requireAuth(request, response, next) {
  try {
    const header = request.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return response.status(401).json({ error: 'Missing bearer token' });
    const claims = verifyAccessToken(token);
    const user = await findUserById(claims.sub);
    if (!user || user.status !== 'active') return response.status(401).json({ error: 'Invalid session' });
    request.user = user;
    next();
  } catch {
    response.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user) return response.status(401).json({ error: 'Missing session' });
    if (!roles.includes(request.user.role)) return response.status(403).json({ error: 'Insufficient role' });
    next();
  };
}
