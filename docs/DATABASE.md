# Database

Schema lives in `database/schema.sql`; seed data lives in `database/seed.sql`.

## Neon

Use pooled Neon URL for app traffic:

```env
DATABASE_URL=postgresql://user:pass@endpoint-pooler.region.aws.neon.tech/db?sslmode=require
DIRECT_DATABASE_URL=postgresql://user:pass@endpoint.region.aws.neon.tech/db?sslmode=require
```

Run schema in Neon SQL editor or via `psql` against `DIRECT_DATABASE_URL`.

## Supabase

Use Supabase Postgres connection string for backend. Keep service-role key server-only.

```env
DATABASE_URL=postgresql://postgres.project:password@aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://project.supabase.co
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=server-only
```

If exposing tables through Supabase APIs, enable RLS and add role-specific policies. This app backend already enforces RBAC; database RLS is still recommended for defense in depth.

## Local fallback

If `DATABASE_URL` is empty, backend uses in-memory seed data. This is for demos only; data resets on restart.
