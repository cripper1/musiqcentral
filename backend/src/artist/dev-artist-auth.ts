import { createHash, timingSafeEqual } from "node:crypto";
import { getIdentityDb } from "../identity-db.js";
import { query } from "../db.js";

export const devArtistEnabled = () => process.env.MUSIQ_ENV === "development" && process.env.ENABLE_DEV_REGISTRATION === "true";

export async function devArtistActor(headers: Record<string, unknown>): Promise<string | null> {
  const secret = process.env.DEV_REGISTRATION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error("DEV_REGISTRATION_SECRET required");
  const key = headers["x-dev-registration-secret"];
  const token = headers["x-dev-session"];
  if (typeof key !== "string" || typeof token !== "string" || token.length > 128) return null;
  const a = createHash("sha256").update(key).digest();
  const b = createHash("sha256").update(secret).digest();
  if (!timingSafeEqual(a,b)) return null;
  const db = await getIdentityDb();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const session = await db.collection<{party_id:string;account_id:string;expires_at:Date}>("dev_sessions")
    .findOne({token_hash:tokenHash,expires_at:{$gt:new Date()}});
  if (!session) return null;
  const result = await query<{party_id:string}>(`SELECT a.party_id::text FROM iam.account a
    JOIN iam.account_status s ON s.status_id=a.status_id
    JOIN iam.account_provisioning p ON p.account_id=a.account_id
    WHERE a.account_id=$1 AND a.party_id=$2 AND a.end_date IS NULL AND s.code='active' AND p.state='complete'`,
    [session.account_id,session.party_id]);
  return result.rows[0]?.party_id ?? null;
}
