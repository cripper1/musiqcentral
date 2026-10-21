-- MusiQ Central | DEV migration 001 | 2026-10-21
-- Reviewable PostgreSQL 18 DDL. Apply only to musiqcentral_dev with a migration/DDL role.
-- Baseline applied manually to DEV on 2026-10-21; GitHub stores the reproducible migration.
-- No PII, shadow IDs, passwords, or external subjects.
-- COMPLETE migration: includes all 16 tables in foreign-key dependency order.
-- Creates the 16 tables in foreign-key dependency order.
-- IF NOT EXISTS protects against existing objects but does not validate their definitions.
-- Creates the five schemas if absent, then the 16 tables and indexes.
-- Do not run the duplicated/truncated pasted fragment beginning with iam.auth_grant.
-- IMPORTANT: Review rights status transitions, effective-date overlap and role grants before application use.
-- No destructive rollback statements included.

BEGIN;

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS iam;
CREATE SCHEMA IF NOT EXISTS artist;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS rights;


CREATE TABLE IF NOT EXISTS core.party_type (
  type_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_party_type_dates CHECK (end_date IS NULL OR end_date > begin_date)
);

CREATE TABLE IF NOT EXISTS core.party (
  party_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  party_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  type_id BIGINT NOT NULL REFERENCES core.party_type(type_id),
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_party_dates CHECK (end_date IS NULL OR end_date > begin_date)
);

CREATE TABLE IF NOT EXISTS iam.account_status (
  status_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_account_status_dates CHECK (end_date IS NULL OR end_date > begin_date)
);

CREATE TABLE IF NOT EXISTS iam.account (
  account_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  account_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  party_id BIGINT NOT NULL REFERENCES core.party(party_id),
  status_id BIGINT NOT NULL REFERENCES iam.account_status(status_id),
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_account_dates CHECK (end_date IS NULL OR end_date > begin_date)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_account_active_party ON iam.account(party_id) WHERE end_date IS NULL;

CREATE TABLE IF NOT EXISTS core.role (
  role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  descr TEXT,
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_role_dates CHECK (end_date IS NULL OR end_date > begin_date)
);

CREATE TABLE IF NOT EXISTS core.party_role (
  party_role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  party_id BIGINT NOT NULL REFERENCES core.party(party_id),
  role_id BIGINT NOT NULL REFERENCES core.role(role_id),
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_party_role_dates CHECK (end_date IS NULL OR end_date > begin_date)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_party_role_active ON core.party_role(party_id,role_id) WHERE end_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_party_role_role ON core.party_role(role_id);

-- Authorization roles are not business-classification roles.
CREATE TABLE IF NOT EXISTS iam.auth_role (
  auth_role_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  descr TEXT,
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_auth_role_dates CHECK (end_date IS NULL OR end_date > begin_date)
);

-- Grant scope is constrained to an owner Party in this first increment.
-- Asset-specific scopes require an explicit subsequent reviewed model.
CREATE TABLE IF NOT EXISTS iam.auth_grant (
  grant_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id BIGINT NOT NULL REFERENCES core.party(party_id),
  owner_id BIGINT NOT NULL REFERENCES core.party(party_id),
  auth_role_id BIGINT NOT NULL REFERENCES iam.auth_role(auth_role_id),
  granted_by BIGINT NOT NULL REFERENCES core.party(party_id),
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_auth_grant_dates CHECK (end_date IS NULL OR end_date > begin_date)
);
CREATE INDEX IF NOT EXISTS idx_auth_grant_actor ON iam.auth_grant(actor_id,owner_id);
CREATE INDEX IF NOT EXISTS idx_auth_grant_owner ON iam.auth_grant(owner_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_auth_grant_active ON iam.auth_grant(actor_id,owner_id,auth_role_id) WHERE end_date IS NULL;

-- A channel is a durable asset; representation is distinct from control.
CREATE TABLE IF NOT EXISTS artist.artist_channel (
  channel_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  channel_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  name TEXT NOT NULL,
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_artist_channel_dates CHECK (end_date IS NULL OR end_date > begin_date)
);

CREATE TABLE IF NOT EXISTS artist.channel_party (
  channel_party_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  channel_id BIGINT NOT NULL REFERENCES artist.artist_channel(channel_id),
  party_id BIGINT NOT NULL REFERENCES core.party(party_id),
  relation_code TEXT NOT NULL CHECK (relation_code IN ('performer','owner')),
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_channel_party_dates CHECK (end_date IS NULL OR end_date > begin_date)
);
CREATE INDEX IF NOT EXISTS idx_channel_party_party ON artist.channel_party(party_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_channel_party_active ON artist.channel_party(channel_id,party_id,relation_code) WHERE end_date IS NULL;

CREATE TABLE IF NOT EXISTS catalog.composition (
  composition_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  composition_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  title TEXT NOT NULL,
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_composition_dates CHECK (end_date IS NULL OR end_date > begin_date)
);

CREATE TABLE IF NOT EXISTS catalog.recording (
  recording_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recording_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  title TEXT NOT NULL,
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_recording_dates CHECK (end_date IS NULL OR end_date > begin_date)
);

CREATE TABLE IF NOT EXISTS catalog.recording_composition (
  rec_comp_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recording_id BIGINT NOT NULL REFERENCES catalog.recording(recording_id),
  composition_id BIGINT NOT NULL REFERENCES catalog.composition(composition_id),
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_rec_comp_dates CHECK (end_date IS NULL OR end_date > begin_date)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_rec_comp_active ON catalog.recording_composition(recording_id,composition_id) WHERE end_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_rec_comp_composition ON catalog.recording_composition(composition_id);

-- Contribution target is explicit; exactly one of composition or recording.
CREATE TABLE IF NOT EXISTS catalog.contribution (
  contribution_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  party_id BIGINT NOT NULL REFERENCES core.party(party_id),
  composition_id BIGINT REFERENCES catalog.composition(composition_id),
  recording_id BIGINT REFERENCES catalog.recording(recording_id),
  role_id BIGINT NOT NULL REFERENCES core.role(role_id),
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_contribution_target CHECK (num_nonnulls(composition_id,recording_id)=1),
  CONSTRAINT ck_contribution_dates CHECK (end_date IS NULL OR end_date > begin_date)
);
CREATE INDEX IF NOT EXISTS idx_contribution_party ON catalog.contribution(party_id);
CREATE INDEX IF NOT EXISTS idx_contribution_comp ON catalog.contribution(composition_id) WHERE composition_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contribution_rec ON catalog.contribution(recording_id) WHERE recording_id IS NOT NULL;

-- Claim is not verified ownership. Adjudication/territory/splits require a later contract.
CREATE TABLE IF NOT EXISTS rights.rights_assertion (
  assertion_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assertion_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  claimant_id BIGINT NOT NULL REFERENCES core.party(party_id),
  composition_id BIGINT REFERENCES catalog.composition(composition_id),
  recording_id BIGINT REFERENCES catalog.recording(recording_id),
  rights_code TEXT NOT NULL,
  status_code TEXT NOT NULL CHECK (status_code IN ('submitted','review','verified','disputed','rejected','superseded')),
  begin_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  update_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_rights_target CHECK (num_nonnulls(composition_id,recording_id)=1),
  CONSTRAINT ck_rights_dates CHECK (end_date IS NULL OR end_date > begin_date)
);
CREATE INDEX IF NOT EXISTS idx_rights_claimant ON rights.rights_assertion(claimant_id);
CREATE INDEX IF NOT EXISTS idx_rights_comp ON rights.rights_assertion(composition_id) WHERE composition_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rights_rec ON rights.rights_assertion(recording_id) WHERE recording_id IS NOT NULL;

-- Evidence references are metadata only; document bytes are stored separately.
CREATE TABLE IF NOT EXISTS rights.rights_evidence (
  evidence_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assertion_id BIGINT NOT NULL REFERENCES rights.rights_assertion(assertion_id),
  evidence_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  source_ref TEXT NOT NULL,
  digest TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rights_evidence_assertion ON rights.rights_evidence(assertion_id);


-- The app role needs explicit schema USAGE, table privileges and identity-sequence grants
-- assigned by the DBA after reviewing least-privilege access. Do not grant here.
-- update_date must be set by authoritative application writes (no implicit auto-update trigger).
-- End-date and grant overlap prevention beyond active-row uniqueness remain open for review.
COMMIT;

-- Verification: expect 16 application tables across the five schemas.
-- Confirm current_database() = musiqcentral_dev before running.
SELECT current_database() AS database_name;
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema IN ('core', 'iam', 'artist', 'catalog', 'rights')
  AND table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;