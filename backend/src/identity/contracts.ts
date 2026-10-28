/** Stable identity-domain contracts. No database or HTTP dependencies. */
export type VerifiedIdentity = Readonly<{
  issuer: string;
  subject: string;
}>;

export type ShadowId = string;
export type PartyId = string;
export type AccountId = string;

export type ProvisioningResult = Readonly<{
  shadowId: ShadowId;
  partyId: PartyId;
  accountId: AccountId;
  created: boolean;
}>;

/** Adapter boundary for restricted external-identity mappings. */
export interface ExternalIdentityRepository {
  resolveOrCreate(verified: VerifiedIdentity): Promise<ShadowId>;
}

/** Adapter boundary for the separately restricted shadow-to-party mapping. */
export interface ShadowPartyRepository {
  findPartyId(shadowId: ShadowId): Promise<PartyId | null>;
  bindPartyId(shadowId: ShadowId, partyId: PartyId): Promise<void>;
}

/** Relational Party/Account persistence; implementation must use one PG transaction. */
export interface PartyAccountRepository {
  findByPartyId(partyId: PartyId): Promise<{ partyId: PartyId; accountId: AccountId; status: string; provisioningState: string | null } | null>;
  createPersonAccount(): Promise<{ partyId: PartyId; accountId: AccountId }>;
}

/**
 * SSO verifier contract. Only implementations that verify issuer, audience,
 * signature, expiry, nonce/replay rules and required claims may produce identity.
 */
export interface IdentityVerifier {
  verify(assertion: string): Promise<VerifiedIdentity>;
}

/** Sessions are separate from identities and business classifications. */
export interface SessionService {
  issue(accountId: AccountId): Promise<{ opaqueSessionToken: string; expiresAt: Date }>;
  revoke(opaqueSessionToken: string): Promise<void>;
}

/**
 * Orchestration deliberately awaits a durable recovery/idempotency design before
 * implementation. These contracts do not imply distributed transactions.
 */
export interface IdentityProvisioningService {
  provision(verified: VerifiedIdentity): Promise<ProvisioningResult>;
}
