import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });

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

  const port = Number(process.env.PORT ?? 8080);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port");
  }

  await app.listen({ port, host: "0.0.0.0" });
}

start().catch((error: unknown) => {
  app.log.error(error, "Failed to start MusIQ Central backend");
  process.exit(1);
});
