import { getIdentityDb } from "../identity-db.js";
import type { PartyId, ShadowId, ShadowPartyRepository } from "./contracts.js";

type Mapping = { shadow_id: string; party_id: string; created_at: Date };

/** Restricted identity vault: no external subjects or shadow IDs in PostgreSQL. */
export class MongoShadowPartyRepository implements ShadowPartyRepository {
  async findPartyId(shadowId: ShadowId): Promise<PartyId | null> {
    const db = await getIdentityDb();
    const found = await db.collection<Mapping>("shadow_party_mapping").findOne({ shadow_id: shadowId });
    return found?.party_id ?? null;
  }

  async bindPartyId(shadowId: ShadowId, partyId: PartyId): Promise<void> {
    const db = await getIdentityDb();
    const result = await db.collection<Mapping>("shadow_party_mapping").updateOne(
      { shadow_id: shadowId },
      { $setOnInsert: { shadow_id: shadowId, party_id: partyId, created_at: new Date() } },
      { upsert: true },
    );
    if (result.upsertedCount === 0) {
      const existing = await this.findPartyId(shadowId);
      if (existing !== partyId) throw new Error("Identity mapping conflict");
    }
  }
}
