import { connectDb, query } from "../db.js";
import type { PartyAccountRepository, PartyId, AccountId } from "./contracts.js";

type AccountRow = { party_id: string; account_id: string; status: string; provisioning_state: string | null };

/** PostgreSQL owns Party, Account, and registration state. */
export class PostgresPartyAccountRepository implements PartyAccountRepository {
  async findByPartyId(partyId: PartyId): Promise<{ partyId: PartyId; accountId: AccountId; status: string; provisioningState: string | null } | null> {
    const result = await query<AccountRow>(
      `SELECT a.party_id::text, a.account_id::text, s.code AS status, p.state AS provisioning_state
       FROM iam.account a JOIN iam.account_status s ON s.status_id = a.status_id
       LEFT JOIN iam.account_provisioning p ON p.account_id = a.account_id
       WHERE a.party_id = $1 AND a.end_date IS NULL`,
      [partyId],
    );
    const row = result.rows[0];
    return row ? { partyId: row.party_id, accountId: row.account_id, status: row.status, provisioningState: row.provisioning_state } : null;
  }

  async createPersonAccount(): Promise<{ partyId: PartyId; accountId: AccountId }> {
    const client = await connectDb();
    try {
      await client.query("BEGIN");
      const party = await client.query<{ party_id: string }>(
        "INSERT INTO core.party(type_id) SELECT type_id FROM core.party_type WHERE code = $1 RETURNING party_id::text",
        ["person"],
      );
      const partyId = party.rows[0]?.party_id;
      if (!partyId) throw new Error("Person party type is not configured");
      const account = await client.query<{ account_id: string }>(
        "INSERT INTO iam.account(party_id, status_id) SELECT $1, status_id FROM iam.account_status WHERE code = $2 RETURNING account_id::text",
        [partyId, "pending"],
      );
      const accountId = account.rows[0]?.account_id;
      if (!accountId) throw new Error("Pending account status is not configured");
      await client.query(
        "INSERT INTO iam.account_provisioning(account_id, state) VALUES ($1, $2)",
        [accountId, "pending_identity"],
      );
      await client.query("COMMIT");
      return { partyId, accountId };
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Only newly provisioned pending accounts may transition to active. */
  async activate(accountId: AccountId): Promise<void> {
    const client = await connectDb();
    try {
      await client.query("BEGIN");
      const updated = await client.query(
        "UPDATE iam.account SET status_id = s.status_id, update_date = now() FROM iam.account_status s WHERE iam.account.account_id = $1 AND s.code = 'active' AND iam.account.end_date IS NULL AND iam.account.status_id = (SELECT status_id FROM iam.account_status WHERE code = 'pending') AND EXISTS (SELECT 1 FROM iam.account_provisioning p WHERE p.account_id = $1 AND p.state = 'pending_identity')",
        [accountId],
      );
      if (updated.rowCount !== 1) throw new Error("Account activation failed");
      const completed = await client.query(
        "UPDATE iam.account_provisioning SET state = 'complete', completed_at = now(), updated_at = now(), attempt_count = attempt_count + 1 WHERE account_id = $1 AND state = 'pending_identity'",
        [accountId],
      );
      if (completed.rowCount !== 1) throw new Error("Provisioning state missing");
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
}
