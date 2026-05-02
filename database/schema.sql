CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  mobile text UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('citizen','operator','admin','auditor')) DEFAULT 'citizen',
  status text NOT NULL CHECK (status IN ('active','blocked')) DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  state text,
  district text,
  address text,
  masked_identity_ref text,
  verified_at timestamptz
);

CREATE TABLE IF NOT EXISTS kendras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  address text NOT NULL,
  latitude numeric,
  longitude numeric,
  status text NOT NULL CHECK (status IN ('open','busy','closed')) DEFAULT 'open',
  open_hours text NOT NULL DEFAULT '10:00 AM - 6:00 PM',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  required_docs jsonb NOT NULL DEFAULT '[]'::jsonb,
  fee numeric NOT NULL DEFAULT 0,
  sla_hours int NOT NULL DEFAULT 72,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no text UNIQUE NOT NULL,
  user_id uuid REFERENCES app_users(id),
  kendra_id uuid REFERENCES kendras(id),
  service_id uuid REFERENCES service_catalog(id),
  status text NOT NULL CHECK (status IN ('submitted','in_review','documents_needed','approved','rejected','completed')) DEFAULT 'submitted',
  priority text NOT NULL CHECK (priority IN ('normal','urgent')) DEFAULT 'normal',
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS service_request_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES app_users(id),
  from_status text,
  to_status text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_elections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft','open','closed')) DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES demo_elections(id) ON DELETE CASCADE,
  name text NOT NULL,
  symbol text NOT NULL,
  color text NOT NULL
);

CREATE TABLE IF NOT EXISTS demo_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid NOT NULL REFERENCES demo_elections(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES demo_candidates(id),
  user_id uuid REFERENCES app_users(id),
  receipt_no text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election_id, user_id)
);

CREATE TABLE IF NOT EXISTS refresh_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES app_users(id),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  request_id text,
  ip text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_requests_user ON service_requests(user_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_status ON service_requests(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
