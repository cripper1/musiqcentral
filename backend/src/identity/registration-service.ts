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
        return { shadowId, partyId: existing.partyId, accountId: existing.accountId, created: false };
      }
      // Persist the recovery pointer in the restricted identity vault before creating
      // a PostgreSQL account. A retry reuses the same account if the process fails.
      const intents = db.collection<{ shadow_id: string; party_id?: string; account_id?: string; created_at: Date }>("registration_intents");
      const intent = await intents.findOne({ shadow_id: shadowId });
      if (intent?.party_id && intent.account_id) {
        const pending = await this.accounts.findByPartyId(intent.party_id);
        if (!pending || pending.accountId !== intent.account_id) throw new Error("Registration recovery account mismatch");
        if (pending.status !== "pending" || pending.provisioningState !== "pending_identity") throw new Error("Registration recovery account not pending");
        await this.mappings.bindPartyId(shadowId, intent.party_id);
        await this.accounts.activate(intent.account_id);
        await intents.deleteOne({ shadow_id: shadowId, account_id: intent.account_id });
        return { shadowId, partyId: intent.party_id, accountId: intent.account_id, created: false };
      }
      if (intent) throw new Error("Registration recovery requires reconciliation");
      await intents.insertOne({ shadow_id: shadowId, created_at: new Date() });
      const created = await this.accounts.createPersonAccount();
      await intents.updateOne({ shadow_id: shadowId }, { $set: { party_id: created.partyId, account_id: created.accountId } });
      await this.mappings.bindPartyId(shadowId, created.partyId);
      await this.accounts.activate(created.accountId);
      await intents.deleteOne({ shadow_id: shadowId, account_id: created.accountId });
      return { shadowId, ...created, created: true };
    } finally {
      await locks.deleteOne({ shadow_id: shadowId, owner });
    }
  }
}
