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
        await this.accounts.activate(existing.accountId);
        return { shadowId, ...existing, created: false };
      }
      const created = await this.accounts.createPersonAccount();
      await this.mappings.bindPartyId(shadowId, created.partyId);
      await this.accounts.activate(created.accountId);
      return { shadowId, ...created, created: true };
    } finally {
      await locks.deleteOne({ shadow_id: shadowId, owner });
    }
  }
}
