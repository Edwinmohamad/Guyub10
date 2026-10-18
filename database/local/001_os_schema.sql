-- LOCAL DISPOSABLE DATABASE ONLY. Never run this against production Supabase.
-- Separate schema prevents collisions with public.warga, public.surat, kas,
-- fasilitas, umkm, pengumuman, etc. The running offline simulator uses JSON.
-- This migration specifies the future PostgreSQL boundary; it is not a connector.
BEGIN;
CREATE SCHEMA IF NOT EXISTS guyub_local;
REVOKE ALL ON SCHEMA guyub_local FROM PUBLIC;
CREATE TABLE IF NOT EXISTS guyub_local.organizations (
 id text PRIMARY KEY CHECK (id IN ('RW10','01','02','03','04')),
 parent_id text REFERENCES guyub_local.organizations(id), name text NOT NULL,
 profile jsonb NOT NULL DEFAULT '{}'
);
INSERT INTO guyub_local.organizations(id,name) VALUES ('RW10','RW 10') ON CONFLICT DO NOTHING;
INSERT INTO guyub_local.organizations(id,parent_id,name) VALUES ('01','RW10','RT 01'),('02','RW10','RT 02'),('03','RW10','RT 03'),('04','RW10','RT 04') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS guyub_local.roles (name text PRIMARY KEY);
INSERT INTO guyub_local.roles VALUES ('SUPER_ADMIN'),('KETUA_RW'),('PENGURUS_RW'),('KETUA_RT'),('ADMIN_RT'),('SECURITY'),('OPERATOR'),('POKJA10'),('RESIDENT'),('STUDENT') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS guyub_local.resident_profiles (
 id uuid PRIMARY KEY, full_name text NOT NULL, rt text NOT NULL REFERENCES guyub_local.organizations(id),
 status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','VERIFIED','ACTIVE','SUSPENDED')),
 private_data jsonb NOT NULL DEFAULT '{}', photo_path text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS guyub_local.user_roles (
 user_id uuid REFERENCES guyub_local.resident_profiles(id), role text REFERENCES guyub_local.roles(name),
 PRIMARY KEY(user_id,role)
);
CREATE TABLE IF NOT EXISTS guyub_local.households (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), rt text NOT NULL REFERENCES guyub_local.organizations(id),
 private_data jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS guyub_local.household_members (
 household_id uuid REFERENCES guyub_local.households(id), resident_id uuid REFERENCES guyub_local.resident_profiles(id),
 head_of_family boolean NOT NULL DEFAULT false, PRIMARY KEY(household_id,resident_id)
);
-- One typed operational registry avoids duplicating existing public tables.
-- Once integration is authorized, adapters should reuse public.surat (letters),
-- public.warga (residents), public.kas (finance), public.fasilitas, public.umkm,
-- public.pengumuman (news). Do not blindly copy or migrate production data.
CREATE TABLE IF NOT EXISTS guyub_local.records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 module text NOT NULL CHECK(module IN ('news','activities','letters','incidents','tasks','cameras','wifi','students','finance','facilities','bookings','umkm','projects','pokja','documents','assets','organization','gallery','emergency')),
 rt text NOT NULL REFERENCES guyub_local.organizations(id), owner_id uuid REFERENCES guyub_local.resident_profiles(id),
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 120), status text NOT NULL,
 public_data jsonb NOT NULL DEFAULT '{}', private_data jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS records_scope ON guyub_local.records(module,rt,owner_id);
CREATE TABLE IF NOT EXISTS guyub_local.activities_log (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid, rt text NOT NULL,
 action text NOT NULL, target_id uuid, at timestamptz NOT NULL DEFAULT now()
);
-- Fail closed: identity must be supplied by trusted DB auth, not by public clients.
-- current_setting reads JWT subject injected by PostgREST/Supabase, not editable
-- application profile metadata. No anonymous table grants are provided.
CREATE OR REPLACE FUNCTION guyub_local.actor_id() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
CREATE OR REPLACE FUNCTION guyub_local.has_role(allowed text[]) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,guyub_local AS $$
 SELECT EXISTS(SELECT 1 FROM guyub_local.user_roles r JOIN guyub_local.resident_profiles p ON p.id=r.user_id
 WHERE r.user_id=guyub_local.actor_id() AND p.status IN ('VERIFIED','ACTIVE') AND r.role=ANY(allowed))
$$;
CREATE OR REPLACE FUNCTION guyub_local.can_manage(target_rt text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog,guyub_local AS $$
 SELECT guyub_local.has_role(ARRAY['SUPER_ADMIN','KETUA_RW','PENGURUS_RW']) OR
 (guyub_local.has_role(ARRAY['KETUA_RT','ADMIN_RT']) AND EXISTS(SELECT 1 FROM guyub_local.resident_profiles p WHERE p.id=guyub_local.actor_id() AND p.rt=target_rt))
$$;
ALTER TABLE guyub_local.resident_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guyub_local.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guyub_local.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE guyub_local.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE guyub_local.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE guyub_local.activities_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS resident_read ON guyub_local.resident_profiles;
CREATE POLICY resident_read ON guyub_local.resident_profiles FOR SELECT USING (id=guyub_local.actor_id() OR guyub_local.can_manage(rt));
DROP POLICY IF EXISTS record_read ON guyub_local.records;
CREATE POLICY record_read ON guyub_local.records FOR SELECT USING (
 guyub_local.can_manage(rt) OR (owner_id=guyub_local.actor_id() AND guyub_local.has_role(ARRAY['RESIDENT','STUDENT']))
);
DROP POLICY IF EXISTS record_write ON guyub_local.records;
CREATE POLICY record_write ON guyub_local.records FOR ALL USING (guyub_local.can_manage(rt)) WITH CHECK (guyub_local.can_manage(rt));
DROP POLICY IF EXISTS household_read ON guyub_local.households;
CREATE POLICY household_read ON guyub_local.households FOR SELECT USING (guyub_local.can_manage(rt));
DROP POLICY IF EXISTS audit_read ON guyub_local.activities_log;
CREATE POLICY audit_read ON guyub_local.activities_log FOR SELECT USING (guyub_local.can_manage(rt));
-- No client write policies for profiles/roles/audit: trusted server transactions
-- alone may verify residents, assign roles, or append immutable audit entries.
-- Public summaries must be served by an explicit field projection, never SELECT *.
REVOKE ALL ON ALL TABLES IN SCHEMA guyub_local FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA guyub_local FROM PUBLIC;
COMMIT;
