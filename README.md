# eBharat EVM + Digital Seva Kendra

Government-style hackathon app with frontend, backend auth, service desk workflow, Postgres schema, and demo EVM awareness module.

## Run

```bash
npm install
cp .env.example .env
npm run dev:full
```

Open `http://localhost:8080`. API runs at `http://localhost:8081/api`.

Default local admin when no database is configured:

- Email: `admin@ebharat.local`
- Password: `Admin@12345`

## What Is Built

- React + Vite frontend on port `8080`.
- Express API on port `8081`.
- JWT auth with hashed passwords and role-aware routes.
- Citizen service requests with operator/admin status updates.
- Digital Seva Kendra catalogue and locator data.
- Demo EVM election with one backend-recorded demo vote per user.
- Postgres schema for Neon or Supabase.
- In-memory fallback for hackathon demos without DB credentials.

## Database

Apply `database/schema.sql`, then `database/seed.sql` in Neon or Supabase Postgres. Set `DATABASE_URL` in `.env`.

Details: `docs/DATABASE.md`.

## API

Endpoint list: `docs/API.md`.

## Security Notes

- Demo EVM is awareness-only, not real election infrastructure.
- Do not store raw Aadhaar or sensitive identity numbers.
- Keep `JWT_*`, `DATABASE_URL`, and Supabase service-role keys server-only.
- Use Neon pooled URLs for app traffic and direct URLs for migrations.
- Enable Supabase RLS if tables are exposed through Supabase APIs.
