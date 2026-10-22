import { MongoClient, type Db } from "mongodb";

let client: MongoClient | undefined;
let connection: Promise<Db> | undefined;

export function getIdentityDb(): Promise<Db> {
  if (!connection) {
    const uri = process.env.MONGODB_URI;
    const databaseName = process.env.MONGODB_DB;
    if (!uri || !databaseName) {
      throw new Error("MONGODB_URI and MONGODB_DB must be configured");
    }
    const nextClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
      retryWrites: true,
    });
    client = nextClient;
    connection = nextClient.connect()
      .then(async () => {
        const db = nextClient.db(databaseName);
        await db.command({ ping: 1 });
        return db;
      })
      .catch(async () => {
        connection = undefined;
        client = undefined;
        await nextClient.close();
        throw new Error("MongoDB identity vault connection failed");
      });
  }
  return connection;
}

export async function closeIdentityDb(): Promise<void> {
  const active = client;
  client = undefined;
  connection = undefined;
  if (active) await active.close();
}
