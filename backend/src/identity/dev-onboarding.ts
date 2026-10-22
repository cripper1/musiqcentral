import { createHash, createHmac, randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { getIdentityDb } from "../identity-db.js";
import { query } from "../db.js";
import { resolveShadowId } from "../identity-mapping.js";
import { RegistrationProvisioningService } from "./registration-service.js";

const enabled = () => process.env.MUSIQ_ENV === "development" && process.env.ENABLE_DEV_REGISTRATION === "true";
const registration = new RegistrationProvisioningService({ resolveOrCreate: resolveShadowId });
const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const emailSubject = (email: string) => {
  const key = process.env.IDENTITY_LOOKUP_KEY;
  if (!key || Buffer.byteLength(key) < 32) throw new Error("IDENTITY_LOOKUP_KEY is required");
  return createHmac("sha256", key).update("dev-demo-email:").update(email).digest("hex");
};
type Body = { name: string; email: string; decision: "approved" | "denied" };
const bodySchema = { type: "object", additionalProperties: false, required: ["name","email","decision"], properties: {
  name: { type: "string", minLength: 1, maxLength: 120 },
  email: { type: "string", minLength: 3, maxLength: 254 },
  decision: { type: "string", enum: ["approved","denied"] },
}} as const;

export function registerDevOnboarding(app: FastifyInstance): void {
  if (!enabled()) return;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error("DEV_REGISTRATION_SECRET must be at least 32 bytes");
  // Only the Next.js server can call these endpoints. No browser-accessible key.
  const allowed = (value: unknown): boolean => typeof value === "string" &&
    Buffer.byteLength(value) === Buffer.byteLength(secret) &&
    createHash("sha256").update(value).digest("hex") === createHash("sha256").update(secret).digest("hex");
  app.post("/dev/onboarding", { bodyLimit: 2048, schema: { body: bodySchema } }, async (request, reply) => {
    if (!allowed(request.headers["x-dev-registration-secret"])) return reply.code(404).send({ message: "Not found" });
    const input = request.body as Body;
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return reply.code(400).send({ message: "Valid name and email are required." });
    if (input.decision === "denied") return reply.code(403).send({ message: "DEV identity provider denied the request.", demo: { provider: "simulated", identity: "denied" } });
    try {
      const subject = emailSubject(email);
      const result = await registration.provision({ issuer: "musiq-network:dev-simulator", subject });
      const db = await getIdentityDb();
      // Profile is app-owned, not a blockchain record. Never write email into the PG identity schema.
      await db.collection("dev_registration_profiles").updateOne(
        { shadow_id: result.shadowId },
        { $set: { name, email, updated_at: new Date() }, $setOnInsert: { shadow_id: result.shadowId, created_at: new Date() } },
        { upsert: true },
      );
      const account = await query<{ account_id: string; party_id: string; status: string; state: string }>(
        `SELECT a.account_id::text, a.party_id::text, s.code AS status, p.state
         FROM iam.account a JOIN iam.account_status s ON s.status_id = a.status_id
         JOIN iam.account_provisioning p ON p.account_id = a.account_id WHERE a.account_id = $1`,
        [result.accountId],
      );
      const mapping = await db.collection("shadow_party_mapping").findOne({ shadow_id: result.shadowId, party_id: result.partyId });
      const profile = await db.collection("dev_registration_profiles").findOne({ shadow_id: result.shadowId, email });
      if (account.rows[0]?.status !== "active" || account.rows[0]?.state !== "complete" || !mapping || !profile) throw new Error("DEV registration readback failed");
      const token = randomBytes(32).toString("base64url");
      const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
      await db.collection("dev_sessions").insertOne({ token_hash: hash(token), account_id: result.accountId, party_id: result.partyId, expires_at: expiresAt, created_at: new Date() });
      const session = await db.collection("dev_sessions").findOne({ token_hash: hash(token), account_id: result.accountId });
      if (!session) throw new Error("Session readback failed");
      return reply.send({
        message: result.created ? "MusIQ Central registration completed." : "Existing MusIQ Central account retrieved.",
        sessionToken: token, expiresAt: expiresAt.toISOString(),
        demo: { provider: "simulated", identity: "approved", testIdentity: subject.slice(0, 12) },
        registration: { name, email, partyId: result.partyId, accountId: result.accountId, shadowId: result.shadowId, created: result.created },
        verified: { postgres: true, mongoMapping: true, profile: true, session: true },
      });
    } catch (error) {
      app.log.error({ err: error, requestId: request.id }, "DEV onboarding failed");
      return reply.code(503).send({ message: "Registration could not be verified against DEV databases.", requestId: request.id });
    }
  });
  app.get("/dev/session", async (request, reply) => {
    if (!allowed(request.headers["x-dev-registration-secret"])) return reply.code(404).send({ message: "Not found" });
    const token = request.headers["x-dev-session"];
    if (typeof token !== "string" || token.length > 128) return reply.code(401).send({ message: "Not signed in." });
    const db = await getIdentityDb();
    const session = await db.collection<{ token_hash: string; account_id: string; party_id: string; expires_at: Date }>("dev_sessions").findOne({ token_hash: hash(token), expires_at: { $gt: new Date() } });
    if (!session) return reply.code(401).send({ message: "Session expired or invalid." });
    const account = await query<{ status: string }>("SELECT s.code AS status FROM iam.account a JOIN iam.account_status s ON s.status_id = a.status_id WHERE a.account_id = $1", [session.account_id]);
    if (account.rows[0]?.status !== "active") return reply.code(401).send({ message: "Account not active." });
    return reply.send({ signedIn: true, accountId: session.account_id, partyId: session.party_id });
  });
}
