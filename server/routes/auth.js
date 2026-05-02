import { Router } from 'express';
import { z } from 'zod';
import { login, register } from '../services/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { sanitizeUser } from '../services/users.js';

const router = Router();
const registerSchema = z.object({ email: z.string().email(), mobile: z.string().min(8).optional(), password: z.string().min(8), full_name: z.string().min(2), role: z.enum(['citizen','operator']).optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/register', async (request, response, next) => {
  try { response.status(201).json(await register(registerSchema.parse(request.body), request)); } catch (error) { next(error); }
});

router.post('/login', async (request, response, next) => {
  try { response.json(await login(loginSchema.parse(request.body), request)); } catch (error) { next(error); }
});

router.get('/me', requireAuth, (request, response) => response.json({ user: sanitizeUser(request.user) }));
router.post('/logout', requireAuth, (_request, response) => response.json({ ok: true }));

export default router;
