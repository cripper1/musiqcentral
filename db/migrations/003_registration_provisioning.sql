-- Migration 003: registration provisioning state (apply to DEV after review)
BEGIN;
CREATE TABLE IF NOT EXISTS iam.account_provisioning (
  account_id BIGINT PRIMARY KEY REFERENCES iam.account(account_id),
  state TEXT NOT NULL CHECK (state IN ('pending_identity', 'complete')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_account_provisioning_pending ON iam.account_provisioning(updated_at) WHERE state = 'pending_identity';
COMMIT;
