-- Registration recovery key: opaque UUID, no external identity or shadow ID.
-- Apply before deploying the backend that uses provisioning_key.
BEGIN;
ALTER TABLE iam.account_provisioning ADD COLUMN IF NOT EXISTS provisioning_key UUID;
CREATE UNIQUE INDEX IF NOT EXISTS uq_account_provisioning_key ON iam.account_provisioning(provisioning_key) WHERE provisioning_key IS NOT NULL;
COMMIT;
