import { Pool, type PoolClient, type QueryResultRow } from "pg";

let pool: Pool | undefined;

/**
 * Shared PostgreSQL connection pool.
 * Requires DATABASE_URL to be configured as a runtime secret.
 * Database connections are opened lazily on the first query.
 */
export function getDb(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured");
    }

    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    pool.on("error", (error: Error) => {
      console.error("Unexpected idle PostgreSQL connection error", error);
    });
  }

  return pool;
}

/** Parameterized SQL queries; never concatenate untrusted values into SQL. */
export function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: readonly unknown[] = [],
) {
  return getDb().query<T>(sql, [...params]);
}

/** Use a checked-out client when multiple statements require one transaction. */
export function connectDb(): Promise<PoolClient> {
  return getDb().connect();
}

/** Gracefully close the connection pool on application shutdown. */
export async function closeDb(): Promise<void> {
  if (pool) {
    const current = pool;
    pool = undefined;
    await current.end();
  }
}
