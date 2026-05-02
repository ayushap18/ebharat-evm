import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { hasDatabase, query } from '../db/pool.js';
import { memory } from '../db/memory.js';

const publicUser = (user) => user && ({ id: user.id, email: user.email, mobile: user.mobile, full_name: user.full_name, role: user.role, status: user.status, created_at: user.created_at });

export async function findUserByEmail(email) {
  if (hasDatabase) {
    const { rows } = await query('SELECT * FROM app_users WHERE lower(email)=lower($1) LIMIT 1', [email]);
    return rows[0] || null;
  }
  return memory.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function findUserById(id) {
  if (hasDatabase) {
    const { rows } = await query('SELECT * FROM app_users WHERE id=$1 LIMIT 1', [id]);
    return rows[0] || null;
  }
  return memory.users.find((user) => user.id === id) || null;
}

export async function createUser({ email, mobile, password, full_name, role = 'citizen' }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }
  const password_hash = await bcrypt.hash(password, 12);
  if (hasDatabase) {
    const { rows } = await query(
      'INSERT INTO app_users (email, mobile, password_hash, full_name, role) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [email, mobile || null, password_hash, full_name, role]
    );
    return rows[0];
  }
  const user = { id: crypto.randomUUID(), email, mobile, password_hash, full_name, role, status: 'active', created_at: new Date().toISOString() };
  memory.users.push(user);
  return user;
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

export function sanitizeUser(user) {
  return publicUser(user);
}
