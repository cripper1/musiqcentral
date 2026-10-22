-- DEV ONLY. Delete one registration by its internal account_id.
-- Do not run on staging or production. Run Mongo identity cleanup separately.
-- Confirm target first:
-- SELECT a.account_id, a.party_id, s.code FROM iam.account a
-- JOIN iam.account_status s ON s.status_id=a.status_id
-- WHERE a.account_id = :account_id;
--
-- DBeaver: replace 12345 with the confirmed account_id.
BEGIN;
DO $$
DECLARE target_account BIGINT := 12345;
DECLARE target_party BIGINT;
BEGIN
  SELECT party_id INTO target_party FROM iam.account WHERE account_id = target_account FOR UPDATE;
  IF target_party IS NULL THEN RAISE EXCEPTION 'Account not found'; END IF;
  IF EXISTS (SELECT 1 FROM core.party_role WHERE party_id = target_party)
     OR EXISTS (SELECT 1 FROM iam.auth_grant WHERE actor_id = target_party OR owner_id = target_party OR granted_by = target_party)
     OR EXISTS (SELECT 1 FROM artist.channel_party WHERE party_id = target_party)
     OR EXISTS (SELECT 1 FROM catalog.contribution WHERE party_id = target_party)
     OR EXISTS (SELECT 1 FROM rights.rights_assertion WHERE claimant_id = target_party)
  THEN RAISE EXCEPTION 'Party has dependent business records: refuse test cleanup'; END IF;
  DELETE FROM iam.account_provisioning WHERE account_id = target_account;
  DELETE FROM iam.account WHERE account_id = target_account;
  DELETE FROM core.party WHERE party_id = target_party;
END $$;
ROLLBACK; -- SAFETY DEFAULT: review counts and switch to COMMIT only for intended DEV test data.
