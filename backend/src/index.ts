import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { closeDb, query, setDbLogger } from "./db.js";

const requestedLevel = process.env.LOG_LEVEL?.toLowerCase() ?? "error";
const allowedLevels = ["silent", "fatal", "error", "warn", "info", "debug", "trace"];
if (!allowedLevels.includes(requestedLevel)) {
  throw new Error("LOG_LEVEL must be silent, fatal, error, warn, info, debug, or trace");
}

const app = Fastify({
  logger: {
    level: requestedLevel,
    redact: ["req.headers.authorization", "req.headers.cookie", "res.headers.set-cookie"],
  },
  disableRequestLogging: true,
});

setDbLogger(app.log);

async function start(): Promise<void> {
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "musiqcentral-backend",
  }));

  app.addHook("onClose", async () => {
    await closeDb();
  });

  const port = Number(process.env.PORT ?? 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port");
  }

  // Fail closed: do not serve API traffic without its authoritative database.
  await query("SELECT 1");
  app.log.info("PostgreSQL startup connection verified");

  await app.listen({ port, host: "0.0.0.0" });
}

start().catch((error: unknown) => {
  app.log.error(error, "Failed to start MusIQ Central backend");
  process.exit(1);
});
