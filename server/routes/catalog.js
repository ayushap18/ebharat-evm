import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { createServiceRequest, listKendras, listRequests, listServices, updateRequestStatus } from '../services/catalog.js';

const router = Router();
const createRequestSchema = z.object({ service_id: z.string().uuid(), kendra_id: z.string().uuid().optional(), priority: z.enum(['normal','urgent']).optional(), form_data: z.record(z.any()).optional() });
const statusSchema = z.object({ status: z.enum(['submitted','in_review','documents_needed','approved','rejected','completed']), note: z.string().optional() });

router.get('/services', async (_request, response, next) => { try { response.json({ services: await listServices() }); } catch (error) { next(error); } });
router.get('/kendras', async (_request, response, next) => { try { response.json({ kendras: await listKendras() }); } catch (error) { next(error); } });
router.post('/requests', requireAuth, async (request, response, next) => { try { response.status(201).json({ request: await createServiceRequest(request.user, createRequestSchema.parse(request.body), request) }); } catch (error) { next(error); } });
router.get('/requests', requireAuth, async (request, response, next) => { try { response.json({ requests: await listRequests(request.user) }); } catch (error) { next(error); } });
router.patch('/requests/:id/status', requireAuth, async (request, response, next) => { try { const body = statusSchema.parse(request.body); response.json({ request: await updateRequestStatus(request.user, request.params.id, body.status, body.note, request) }); } catch (error) { next(error); } });

export default router;
