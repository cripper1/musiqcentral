import { randomUUID, timingSafeEqual } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { resolveShadowId } from "../identity-mapping.js";
import { RegistrationProvisioningService } from "./registration-service.js";
import { query } from "../db.js";
import { getIdentityDb } from "../identity-db.js";

/** Real DEV database writes; No external provider or rewards are claimed. */
export function registerDevRegistration(app: FastifyInstance): void {
  if (process.env.MUSIQ_ENV !== "development" || process.env.ENABLE_DEV_REGISTRATION !== "true") return;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error("DEV_REGISTRATION_SECRET must be at least 32 bytes");
  const registration = new RegistrationProvisioningService({ resolveOrCreate: resolveShadowId });
  app.post("/dev/registration", {
    bodyLimit: 2048,
    schema: { body: { type: "object", additionalProperties: false, properties: {} } },
  }, async (request, reply) => {
    const supplied = request.headers["x-dev-registration-secret"];
    if (typeof supplied !== "string" || Buffer.byteLength(supplied) !== Buffer.byteLength(secret) ||
      !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))) return reply.code(404).send({ message: "Not found" });
    const demoId = randomUUID();
    const identity = { issuer: "musiqcentral:dev-demo", subject: demoId };
    try {
      const result = await registration.provision(identity);
      const account = await query<{ account_id: string; party_id: string; status: string; state: string }>(
        `SELECT a.account_id::text, a.party_id::text, s.code AS status, p.state
         FROM iam.account a JOIN iam.account_status s ON s.status_id = a.status_id
         JOIN iam.account_provisioning p ON p.account_id = a.account_id
         WHERE a.account_id = $1`, [result.accountId],
      );
      const db = await getIdentityDb();
      const mapping = await db.collection("shadow_party_mapping").findOne({ shadow_id: result.shadowId, party_id: result.partyId });
      const verified = account.rows[0]?.status === "active" && account.rows[0]?.state === "complete" && !!mapping;
      if (!verified) throw new Error("Registration readback verification failed");
      app.log.info({ requestId: request.id, accountId: result.accountId, demo: true }, "DEV registration verified");
      return reply.send({
        demoId, partyId: result.partyId, accountId: result.accountId,
        database: { postgres: "verified", mongo: "verified", account: "active" },
        external: { status: "not_connected" },
        message: "Registration written and verified in DEV PostgreSQL and MongoDB. External integration is not connected.",
      });
    } catch (error) {
      app.log.error({ err: error, requestId: request.id, demo: true }, "DEV registration failed");
      return reply.code(503).send({ message: "Database registration failed. No success was reported.", requestId: request.id });
    }
  });
}
