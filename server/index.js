import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import catalogRoutes from './routes/catalog.js';
import evmRoutes from './routes/evm.js';
import { hasDatabase, pool } from './db/pool.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
const port = Number(process.env.API_PORT || 8081);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:8080', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (_request, response) => response.json({ ok: true, database: hasDatabase ? 'postgres' : 'memory' }));
app.get('/api/ready', async (_request, response) => {
  if (!hasDatabase) return response.json({ ok: true, database: 'memory-fallback' });
  await pool.query('SELECT 1');
  response.json({ ok: true, database: 'postgres' });
});
app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api', evmRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`eBharat API listening on ${port}`);
});
