import crypto from 'crypto';
import { hasDatabase, query, transaction } from '../db/pool.js';
import { memory } from '../db/memory.js';
import { audit } from './audit.js';

export async function listServices() {
  if (hasDatabase) {
    const { rows } = await query('SELECT * FROM service_catalog WHERE active=true ORDER BY name');
    return rows;
  }
  return memory.services.filter((service) => service.active);
}

export async function listKendras() {
  if (hasDatabase) {
    const { rows } = await query('SELECT * FROM kendras ORDER BY status, district, name');
    return rows;
  }
  return memory.kendras;
}

export async function createServiceRequest(user, payload, request) {
  const reference = `EBH-SEVA-${new Date().getFullYear()}-${crypto.randomInt(100000, 999999)}`;
  if (hasDatabase) {
    return transaction(async (client) => {
      const { rows } = await client.query(
        'INSERT INTO service_requests (reference_no,user_id,kendra_id,service_id,priority,form_data) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [reference, user.id, payload.kendra_id || null, payload.service_id, payload.priority || 'normal', payload.form_data || {}]
      );
      await client.query('INSERT INTO service_request_events (request_id,actor_id,to_status,note) VALUES ($1,$2,$3,$4)', [rows[0].id, user.id, 'submitted', 'Request submitted']);
      await audit({ actorId: user.id, action: 'request.create', targetType: 'service_request', targetId: rows[0].id, request, metadata: { reference } });
      return rows[0];
    });
  }
  const row = { id: crypto.randomUUID(), reference_no: reference, user_id: user.id, kendra_id: payload.kendra_id || null, service_id: payload.service_id, status: 'submitted', priority: payload.priority || 'normal', form_data: payload.form_data || {}, submitted_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  memory.requests.unshift(row);
  memory.events.unshift({ id: crypto.randomUUID(), request_id: row.id, actor_id: user.id, to_status: 'submitted', note: 'Request submitted', created_at: new Date().toISOString() });
  await audit({ actorId: user.id, action: 'request.create', targetType: 'service_request', targetId: row.id, request, metadata: { reference } });
  return row;
}

export async function listRequests(user) {
  if (hasDatabase) {
    const admin = ['admin', 'operator', 'auditor'].includes(user.role);
    const sql = admin
      ? `SELECT sr.*, sc.name service_name, k.name kendra_name, u.full_name citizen_name FROM service_requests sr LEFT JOIN service_catalog sc ON sc.id=sr.service_id LEFT JOIN kendras k ON k.id=sr.kendra_id LEFT JOIN app_users u ON u.id=sr.user_id ORDER BY sr.updated_at DESC LIMIT 100`
      : `SELECT sr.*, sc.name service_name, k.name kendra_name FROM service_requests sr LEFT JOIN service_catalog sc ON sc.id=sr.service_id LEFT JOIN kendras k ON k.id=sr.kendra_id WHERE sr.user_id=$1 ORDER BY sr.updated_at DESC LIMIT 50`;
    const { rows } = await query(sql, admin ? [] : [user.id]);
    return rows;
  }
  const admin = ['admin', 'operator', 'auditor'].includes(user.role);
  return memory.requests.filter((item) => admin || item.user_id === user.id).map((item) => ({
    ...item,
    service_name: memory.services.find((service) => service.id === item.service_id)?.name,
    kendra_name: memory.kendras.find((kendra) => kendra.id === item.kendra_id)?.name,
    citizen_name: memory.users.find((citizen) => citizen.id === item.user_id)?.full_name,
  }));
}

export async function updateRequestStatus(user, id, status, note, request) {
  if (!['admin', 'operator'].includes(user.role)) {
    const error = new Error('Only operators or admins can update status');
    error.status = 403;
    throw error;
  }
  if (hasDatabase) {
    return transaction(async (client) => {
      const before = await client.query('SELECT * FROM service_requests WHERE id=$1', [id]);
      if (!before.rows[0]) {
        const error = new Error('Request not found');
        error.status = 404;
        throw error;
      }
      const { rows } = await client.query('UPDATE service_requests SET status=$1, updated_at=now() WHERE id=$2 RETURNING *', [status, id]);
      await client.query('INSERT INTO service_request_events (request_id,actor_id,from_status,to_status,note) VALUES ($1,$2,$3,$4,$5)', [id, user.id, before.rows[0].status, status, note || null]);
      await audit({ actorId: user.id, action: 'request.status.update', targetType: 'service_request', targetId: id, request, metadata: { from: before.rows[0].status, to: status } });
      return rows[0];
    });
  }
  const row = memory.requests.find((item) => item.id === id);
  if (!row) {
    const error = new Error('Request not found');
    error.status = 404;
    throw error;
  }
  const from = row.status;
  row.status = status;
  row.updated_at = new Date().toISOString();
  memory.events.unshift({ id: crypto.randomUUID(), request_id: id, actor_id: user.id, from_status: from, to_status: status, note, created_at: new Date().toISOString() });
  await audit({ actorId: user.id, action: 'request.status.update', targetType: 'service_request', targetId: id, request, metadata: { from, to: status } });
  return row;
}
