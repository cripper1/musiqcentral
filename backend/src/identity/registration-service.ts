import type { ExternalIdentityRepository, IdentityProvisioningService, ProvisioningResult, VerifiedIdentity } from "./contracts.js";
import { PostgresPartyAccountRepository } from "./party-account-postgres.js";
import { MongoShadowPartyRepository } from "./shadow-party-mongo.js";

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
    const existingPartyId = await this.mappings.findPartyId(shadowId);
    if (existingPartyId !== null) {
      const existing = await this.accounts.findByPartyId(existingPartyId);
      if (!existing) throw new Error("Identity references a missing account");
      await this.accounts.activate(existing.accountId);
      return { shadowId, ...existing, created: false };
    }

    // Pending PostgreSQL state is durable before Mongo mapping is written.
    // This method must not be exposed until a cross-request per-identity
    // provisioning lock/reconciliation path is in place. Otherwise concurrent
    // first-time requests can create unlinked pending accounts.
    const created = await this.accounts.createPersonAccount();
    await this.mappings.bindPartyId(shadowId, created.partyId);
    await this.accounts.activate(created.accountId);
    return { shadowId, ...created, created: true };
  }
}
