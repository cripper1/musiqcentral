import type { ExternalIdentityRepository, IdentityProvisioningService, ProvisioningResult, VerifiedIdentity } from "./contracts.js";
import { PostgresPartyAccountRepository } from "./party-account-postgres.js";
import { MongoShadowPartyRepository } from "./shadow-party-mongo.js";
import { getIdentityDb } from "../identity-db.js";
import { randomUUID } from "node:crypto";

/**
 * Application-owned registration workflow. Accepts only identities already
 * verified by the SSO boundary; never accept browser-supplied issuer/subject.
 * Requires Mongo unique indexes before first use.
 */
export class RegistrationProvisioningService implements IdentityProvisioningService {
  constructor(
    private readonly identities: ExternalIdentityRepository,
    private readonly mappings = new MongoShadowPartyRepository(),
    private readonly accounts = new PostgresPartyAccountRepository(),
  ) {}

  async provision(verified: VerifiedIdentity): Promise<ProvisioningResult> {
    const shadowId = await this.identities.resolveOrCreate(verified);
    const db = await getIdentityDb();
    const locks = db.collection<{ shadow_id: string; owner: string; expires_at: Date }>("registration_locks");
    const owner = randomUUID();
    try {
      await locks.insertOne({ shadow_id: shadowId, owner, expires_at: new Date(Date.now() + 120_000) });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        throw new Error("Registration is already being processed; please retry");
      }
      throw error;
    }
    try {
      const existingPartyId = await this.mappings.findPartyId(shadowId);
      if (existingPartyId !== null) {
        const existing = await this.accounts.findByPartyId(existingPartyId);
        if (!existing) throw new Error("Identity references a missing account");
        if (existing.status === "pending" && existing.provisioningState === "pending_identity") {
          await this.accounts.activate(existing.accountId);
        } else if (existing.status !== "active" || existing.provisioningState !== "complete") {
          throw new Error("Account is not eligible for registration");
        }
        await db.collection("registration_intents").deleteOne({ shadow_id: shadowId });
        return { shadowId, partyId: existing.partyId, accountId: existing.accountId, created: false };
      }
      // The random key lives only in the restricted vault and PostgreSQL provisioning
      // state. PostgreSQL commits the key and account atomically, so a retry can
      // always locate an account even if MongoDB was not updated after commit.
      const intents = db.collection<{ shadow_id: string; provisioning_key: string; created_at: Date }>("registration_intents");
      const intent = await intents.findOne({ shadow_id: shadowId });
      const key = intent?.provisioning_key ?? randomUUID();
      if (!intent) {
        try {
          await intents.insertOne({ shadow_id: shadowId, provisioning_key: key, created_at: new Date() });
        } catch (error) {
          // An existing intent may have been inserted by a previous attempt.
          throw new Error("Registration recovery intent conflict; retry");
        }
      }
      const recovered = await this.accounts.findByProvisioningKey(key);
      if (recovered && (recovered.status !== "pending" || recovered.provisioningState !== "pending_identity")) {
        throw new Error("Registration recovery account is not pending");
      }
      const account = recovered ?? await this.accounts.createPersonAccount(key);
      await this.mappings.bindPartyId(shadowId, account.partyId);
      await this.accounts.activate(account.accountId);
      await intents.deleteOne({ shadow_id: shadowId, provisioning_key: key });
      return { shadowId, partyId: account.partyId, accountId: account.accountId, created: !recovered };
    } finally {
      await locks.deleteOne({ shadow_id: shadowId, owner });
    }
  }
}
