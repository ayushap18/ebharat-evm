# API

Base URL: `http://localhost:8081/api`

## Auth

- `POST /auth/register` — create citizen/operator account.
- `POST /auth/login` — returns `accessToken`, `refreshToken`, and user profile.
- `GET /auth/me` — validates bearer token.
- `POST /auth/logout` — client logout acknowledgement.

## Public Data

- `GET /health` — API and database mode.
- `GET /ready` — readiness check.
- `GET /services` — service catalogue.
- `GET /kendras` — kendra list.
- `GET /demo-election` — active demo election and candidates.

## Citizen / Operator

- `POST /requests` — create service request. Requires auth.
- `GET /requests` — citizen sees own requests; operator/admin sees queue.
- `PATCH /requests/:id/status` — operator/admin status update.
- `POST /demo-votes` — cast one demo vote per user/election.
- `GET /demo-results` — restricted to admin/operator/auditor.
