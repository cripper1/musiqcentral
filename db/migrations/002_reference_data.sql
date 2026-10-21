-- MusiQ Central | Migration 002 | Reference data | 2026-10-21
-- Target: musiqcentral_dev. Requires 001_core_schemas.sql.
-- Seeds controlled vocabulary only. Does not create parties, accounts, grants,
-- rights, or authorization permissions.
-- Business roles classify a party; auth roles do not confer privileges by themselves.
-- Re-runnable: existing code values are preserved; mismatched names fail validation.

BEGIN;

INSERT INTO core.party_type (code, name) VALUES
  ('person', 'Person'),
  ('organization', 'Organization')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.account_status (code, name) VALUES
  ('pending', 'Pending'),
  ('active', 'Active'),
  ('suspended', 'Suspended'),
  ('closed', 'Closed')
ON CONFLICT (code) DO NOTHING;

INSERT INTO core.role (code, name, descr) VALUES
  ('artist', 'Artist', 'Artist or performing act business classification'),
  ('fan', 'Fan', 'Fan business classification'),
  ('manager', 'Manager', 'Artist or business manager classification'),
  ('label', 'Label', 'Record label business classification'),
  ('publisher', 'Publisher', 'Music publisher business classification'),
  ('venue', 'Venue', 'Venue business classification'),
  ('promoter', 'Promoter', 'Event promoter business classification')
ON CONFLICT (code) DO NOTHING;

-- Role definitions are vocabulary only. Effective permissions and resource
-- scopes require a separately approved policy; do not authorize by code alone.
INSERT INTO iam.auth_role (code, name, descr) VALUES
  ('owner', 'Owner', 'Reserved ownership-level authorization role; permissions not yet defined'),
  ('admin', 'Administrator', 'Reserved administration role; permissions not yet defined'),
  ('editor', 'Editor', 'Reserved editing role; permissions not yet defined'),
  ('viewer', 'Viewer', 'Reserved read-only role; permissions not yet defined')
ON CONFLICT (code) DO NOTHING;

-- Fail rather than silently accepting conflicting pre-existing code definitions.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM (VALUES ('person','Person'),('organization','Organization')) v(code,name)
    LEFT JOIN core.party_type t ON t.code=v.code
    WHERE t.type_id IS NULL OR t.name IS DISTINCT FROM v.name
  ) OR EXISTS (
    SELECT 1 FROM (VALUES ('pending','Pending'),('active','Active'),('suspended','Suspended'),('closed','Closed')) v(code,name)
    LEFT JOIN iam.account_status t ON t.code=v.code
    WHERE t.status_id IS NULL OR t.name IS DISTINCT FROM v.name
  ) OR EXISTS (
    SELECT 1 FROM (VALUES ('artist','Artist'),('fan','Fan'),('manager','Manager'),('label','Label'),('publisher','Publisher'),('venue','Venue'),('promoter','Promoter')) v(code,name)
    LEFT JOIN core.role t ON t.code=v.code
    WHERE t.role_id IS NULL OR t.name IS DISTINCT FROM v.name
  ) OR EXISTS (
    SELECT 1 FROM (VALUES ('owner','Owner'),('admin','Administrator'),('editor','Editor'),('viewer','Viewer')) v(code,name)
    LEFT JOIN iam.auth_role t ON t.code=v.code
    WHERE t.auth_role_id IS NULL OR t.name IS DISTINCT FROM v.name
  ) THEN
    RAISE EXCEPTION 'Migration 002: reference data conflict; transaction rolled back';
  END IF;
END $$;

COMMIT;

-- Verification (read-only):
SELECT 'core.party_type' AS ref_table, count(*) AS rows FROM core.party_type
UNION ALL SELECT 'iam.account_status', count(*) FROM iam.account_status
UNION ALL SELECT 'core.role', count(*) FROM core.role
UNION ALL SELECT 'iam.auth_role', count(*) FROM iam.auth_role
ORDER BY ref_table;
