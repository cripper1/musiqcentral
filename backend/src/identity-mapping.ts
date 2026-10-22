import { createHmac, randomUUID } from "node:crypto";
import { getIdentityDb } from "./identity-db.js";

type ExternalIdentity = Readonly<{ issuer: string; subject: string }>;

function identityKey(identity: ExternalIdentity): string {
  if (!identity.issuer || !identity.subject || identity.issuer.length > 512 || identity.subject.length > 512) {
    throw new Error("Invalid verified identity");
  }
  const secret = process.env.IDENTITY_LOOKUP_KEY;
  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("IDENTITY_LOOKUP_KEY must be configured with at least 32 bytes");
  }
  // Length-prefix components so distinct issuer/subject pairs cannot collide by concatenation.
  return createHmac("sha256", secret)
    .update(String(Buffer.byteLength(identity.issuer, "utf8")))
    .update(":")
    .update(identity.issuer)
    .update(String(Buffer.byteLength(identity.subject, "utf8")))
    .update(":")
    .update(identity.subject)
    .digest("hex");
}

/**
 * Restricted identity-vault adapter. Call ONLY after upstream SSO verification.
 * Does not accept browser-supplied identities or grant authentication.
 */
export async function resolveShadowId(verified: ExternalIdentity): Promise<string> {
  const db = await getIdentityDb();
  const mappings = db.collection<{ lookup_key: string; shadow_id: string; created_at: Date }>("external_identity_mapping");
  const lookupKey = identityKey(verified);
  // Unique indexes must be installed by an approved provisioning/migration step,
  // not implicitly by application startup.
  const existing = await mappings.findOne({ lookup_key: lookupKey }, { projection: { shadow_id: 1 } });
  if (existing) return existing.shadow_id;
  const shadowId = randomUUID();
  try {
    await mappings.insertOne({ lookup_key: lookupKey, shadow_id: shadowId, created_at: new Date() });
    return shadowId;
  } catch (error) {
    // Concurrent first login may have inserted the same verified identity.
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      const concurrent = await mappings.findOne({ lookup_key: lookupKey });
      if (concurrent) return concurrent.shadow_id;
    }
    throw error;
  }
}
