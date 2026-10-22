import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { closeDb, query, setDbLogger } from "./db.js";
import { closeIdentityDb, getIdentityDb } from "./identity-db.js";
import { resolveShadowId } from "./identity-mapping.js";
import { RegistrationProvisioningService } from "./identity/registration-service.js";
import { MusiqNetworkJwtVerifier } from "./identity/musiq-sso-verifier.js";

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

  const registration = new RegistrationProvisioningService({ resolveOrCreate: resolveShadowId });
  const verifier = new MusiqNetworkJwtVerifier();

  app.post("/registration", {
    bodyLimit: 12_000,
    schema: { body: { type: "object", additionalProperties: false, required: ["assertion"], properties: { assertion: { type: "string", minLength: 1, maxLength: 8192 } } } },
  }, async (request, reply) => {
    const body = request.body as { assertion: string };
    try {
      const verified = await verifier.verify(body.assertion);
      const result = await registration.provision(verified);
      app.log.info({ accountId: result.accountId, created: result.created }, "Registration completed");
      return reply.code(200).send({ message: "Your MusIQ Central account is ready.", created: result.created });
    } catch (error) {
      app.log.error({ err: error, requestId: request.id }, "Registration failed");
      return reply.code(400).send({ message: "Registration could not be completed. Please retry or contact support.", requestId: request.id });
    }
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "musiqcentral-backend",
  }));

  app.addHook("onClose", async () => {
    await Promise.all([closeDb(), closeIdentityDb()]);
  });

  const port = Number(process.env.PORT ?? 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port");
  }

  // Fail closed: do not serve API traffic without its authoritative database.
  await query("SELECT 1");
  app.log.info("PostgreSQL startup connection verified");
  await getIdentityDb();
  app.log.info("MongoDB identity vault startup connection verified");

  await app.listen({ port, host: "0.0.0.0" });
}

start().catch((error: unknown) => {
  app.log.error(error, "Failed to start MusIQ Central backend");
  process.exit(1);
});
