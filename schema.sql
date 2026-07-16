-- ============================================================
-- TaskFlow — Supabase Database Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ──────────────────────────────────────────────────────────────
-- SITES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sites (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    NOT NULL,
  code        TEXT,
  category    TEXT    DEFAULT 'Other',
  address     TEXT,
  status      TEXT    DEFAULT 'active',   -- active | inactive
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sites_name   ON sites (name);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites (status);


-- ──────────────────────────────────────────────────────────────
-- VENDORS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    NOT NULL,
  code        TEXT,
  category    TEXT    DEFAULT 'Other',   -- Electrical | Plumbing | HVAC | IT-SaaS | etc.
  contact     TEXT,
  email       TEXT,
  phone       TEXT,
  notes       TEXT,
  status      TEXT    DEFAULT 'Active',  -- Active | Inactive
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_name   ON vendors (name);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors (status);


-- ──────────────────────────────────────────────────────────────
-- ROLES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    NOT NULL UNIQUE,
  description TEXT,
  color       TEXT    DEFAULT '#6c63ff',
  permissions JSONB   DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT    NOT NULL,
  role            TEXT,                  -- references roles.name (soft ref)
  email           TEXT,
  phone           TEXT,
  assigned_vendor TEXT,                  -- vendor name (soft ref)
  assigned_sites  TEXT[]  DEFAULT '{}',  -- array of site names
  notes           TEXT,
  status          TEXT    DEFAULT 'Active',  -- Active | Inactive
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);


-- ──────────────────────────────────────────────────────────────
-- TASKS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT    NOT NULL,
  priority    TEXT    DEFAULT 'Medium',  -- Low | Medium | High
  status      TEXT    DEFAULT 'To Do',   -- To Do | In Progress | Done
  category    TEXT,
  due_date    DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);


-- ──────────────────────────────────────────────────────────────
-- FIELD VISITS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visits (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor      TEXT,
  site        TEXT,
  description TEXT,
  date        DATE,
  invoice_num TEXT,
  amount      NUMERIC(12,2) DEFAULT 0,
  status      TEXT    DEFAULT 'Pending',  -- Pending | Approved | Paid | Disputed
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visits_site   ON visits (site);
CREATE INDEX IF NOT EXISTS idx_visits_vendor ON visits (vendor);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits (status);


-- ──────────────────────────────────────────────────────────────
-- INVOICES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  description     TEXT,
  vendor          TEXT,
  invoice_num     TEXT,
  po_num          TEXT,
  amount          NUMERIC(12,2) DEFAULT 0,
  invoice_date    DATE,
  due_date        DATE,
  category        TEXT    DEFAULT 'Field Work',
  status          TEXT    DEFAULT 'Draft',  -- Draft | Submitted | Approved | Paid | Rejected
  attachment_path TEXT,                     -- Supabase Storage path
  attachment_name TEXT,                     -- original filename
  approval_trail  JSONB   DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_vendor     ON invoices (vendor);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date   ON invoices (due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_category   ON invoices (category);


-- ──────────────────────────────────────────────────────────────
-- DEVICES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT    NOT NULL,
  type            TEXT,
  brand           TEXT,
  serial          TEXT,
  asset           TEXT    UNIQUE,
  os              TEXT,
  ip              TEXT,
  purchased       DATE,
  warranty        DATE,
  assigned_to     TEXT,
  site            TEXT,
  vendor          TEXT,
  status          TEXT    DEFAULT 'Active',  -- Active | In Storage | Under Repair | Missing | Decommissioned
  notes           TEXT,
  attachment_path TEXT,                      -- Supabase Storage path (warranty doc / receipt)
  attachment_name TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devices_site   ON devices (site);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices (status);
CREATE INDEX IF NOT EXISTS idx_devices_asset  ON devices (asset);


-- ──────────────────────────────────────────────────────────────
-- ATTACHMENTS  (multi-file per record, e.g. invoices/devices)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT    NOT NULL,  -- 'invoice' | 'device' | 'visit'
  entity_id   UUID    NOT NULL,
  file_name   TEXT    NOT NULL,
  file_path   TEXT    NOT NULL,  -- Supabase Storage path
  file_size   INTEGER,
  mime_type   TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments (entity_type, entity_id);


-- ──────────────────────────────────────────────────────────────
-- PROJECTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    NOT NULL,
  category    TEXT    DEFAULT 'Other',
  priority    TEXT    DEFAULT 'Medium',   -- Low | Medium | High | Critical
  site        TEXT,
  assigned_to TEXT,
  start_date  DATE,
  end_date    DATE,
  progress    INTEGER DEFAULT 0,          -- 0–100
  status      TEXT    DEFAULT 'planning', -- planning | active | hold | completed | cancelled
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_site     ON projects (site);
CREATE INDEX IF NOT EXISTS idx_projects_end_date ON projects (end_date);


-- ──────────────────────────────────────────────────────────────
-- WORKFLOWS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflows (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT    NOT NULL,
  nodes       JSONB   DEFAULT '[]'::jsonb,
  connections JSONB   DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ──────────────────────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sites_updated    BEFORE UPDATE ON sites    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vendors_updated  BEFORE UPDATE ON vendors  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_updated    BEFORE UPDATE ON tasks    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_visits_updated   BEFORE UPDATE ON visits   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_devices_updated  BEFORE UPDATE ON devices  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_projects_updated  BEFORE UPDATE ON projects  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_workflows_updated BEFORE UPDATE ON workflows FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Enable and set permissive policy using the anon key
-- For a production app add proper auth; for now anon key gets full access
-- ──────────────────────────────────────────────────────────────
ALTER TABLE sites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices    ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices     ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows   ENABLE ROW LEVEL SECURITY;

-- Allow full access to anon role (replace with auth policies when you add login)
CREATE POLICY "anon_all_sites"       ON sites       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_vendors"     ON vendors     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_roles"       ON roles       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_users"       ON users       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_tasks"       ON tasks       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_visits"      ON visits      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_invoices"    ON invoices    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_devices"     ON devices     FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_attachments" ON attachments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_projects"    ON projects    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_workflows"   ON workflows   FOR ALL TO anon USING (true) WITH CHECK (true);


-- ──────────────────────────────────────────────────────────────
-- STORAGE
-- Run this AFTER creating the schema. In Supabase Dashboard:
--   Storage → New bucket → Name: "taskflow" → Public: ON
-- Then run the policy below:
-- ──────────────────────────────────────────────────────────────

-- Storage bucket policy (run after creating the bucket in the dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('taskflow', 'taskflow', true);

CREATE POLICY "anon_storage_select" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'taskflow');
CREATE POLICY "anon_storage_insert" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'taskflow');
CREATE POLICY "anon_storage_update" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'taskflow');
CREATE POLICY "anon_storage_delete" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'taskflow');
