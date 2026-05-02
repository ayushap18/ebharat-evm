import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-before-production-32';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-before-production-32';

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, accessSecret, { expiresIn: '15m' });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user.id, jti: crypto.randomUUID() }, refreshSecret, { expiresIn: '7d' });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
