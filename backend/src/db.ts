import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type { FastifyBaseLogger } from "fastify";

let pool: Pool | undefined;
let logger: Pick<FastifyBaseLogger, "error"> | undefined;

/** Share Fastify’s configured logger; no independent console logging. */
export function setDbLogger(appLogger: Pick<FastifyBaseLogger, "error">): void {
  logger = appLogger;
}

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

    const ca = process.env.DB_CA_CERT?.replace(/\\n/g, "\n").trim();
    if (!ca || !ca.includes("-----BEGIN CERTIFICATE-----") || !ca.includes("-----END CERTIFICATE-----")) {
      throw new Error("DB_CA_CERT is missing or invalid");
    }

    // pg connection-string SSL options override the explicit CA settings.
    // Remove only those URL options; keep credentials and all other parameters.
    const databaseUrl = new URL(connectionString);
    for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey"]) {
      databaseUrl.searchParams.delete(key);
    }

    pool = new Pool({
      connectionString: databaseUrl.toString(),
      ssl: { ca, rejectUnauthorized: true },
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    pool.on("error", (error: Error) => {
      logger?.error({ err: error }, "Unexpected idle PostgreSQL connection error");
    });
  }

  return pool;
}

/** Parameterized SQL queries; never concatenate untrusted values into SQL. */
export function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: readonly unknown[] = [],
) {
  return getDb().query<T>(sql, [...params]).catch((error: unknown) => {
    // Never log SQL text, parameters, or the database connection string.
    logger?.error({ err: error }, "PostgreSQL query failed");
    throw error;
  });
}

/** Use a checked-out client when multiple statements require one transaction. */
export function connectDb(): Promise<PoolClient> {
  return getDb().connect().catch((error: unknown) => {
    logger?.error({ err: error }, "PostgreSQL connection checkout failed");
    throw error;
  });
}

/** Gracefully close the connection pool on application shutdown. */
export async function closeDb(): Promise<void> {
  if (pool) {
    const current = pool;
    pool = undefined;
    await current.end();
  }
}
