import "dotenv/config";
import { closeIdentityDb, getIdentityDb } from "../identity-db.js";

/** Run explicitly during approved DEV provisioning; never at API startup. */
async function main(): Promise<void> {
  const db = await getIdentityDb();
  await db.collection("external_identity_mapping").createIndex(
    { lookup_key: 1 }, { unique: true, name: "uq_external_lookup_key" },
  );
  await db.collection("external_identity_mapping").createIndex(
    { shadow_id: 1 }, { unique: true, name: "uq_external_shadow_id" },
  );
  await db.collection("shadow_party_mapping").createIndex(
    { shadow_id: 1 }, { unique: true, name: "uq_shadow_party_shadow_id" },
  );
  await db.collection("shadow_party_mapping").createIndex(
    { party_id: 1 }, { unique: true, name: "uq_shadow_party_party_id" },
  );
}

main().then(() => closeIdentityDb()).catch(async (error: unknown) => {
  process.stderr.write(`Identity index provisioning failed: ${error instanceof Error ? error.name : "unknown"}\n`);
  await closeIdentityDb();
  process.exitCode = 1;
});
