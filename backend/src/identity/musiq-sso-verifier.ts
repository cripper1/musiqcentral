import { createPublicKey, verify as verifySignature } from "node:crypto";
import { getIdentityDb } from "../identity-db.js";
import type { IdentityVerifier, VerifiedIdentity } from "./contracts.js";

type Claims = { iss?: unknown; aud?: unknown; sub?: unknown; exp?: unknown; nbf?: unknown; iat?: unknown; jti?: unknown };
type Jwk = JsonWebKey & { kid?: string; kty?: string; alg?: string; use?: string };

function decodeJson(segment: string): Record<string, unknown> {
  const raw = Buffer.from(segment, "base64url").toString("utf8");
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid SSO assertion");
  return value as Record<string, unknown>;
}

export class MusiqNetworkJwtVerifier implements IdentityVerifier {
  async verify(assertion: string): Promise<VerifiedIdentity> {
    if (assertion.length > 8192) throw new Error("SSO assertion too large");
    const parts = assertion.split(".");
    if (parts.length !== 3) throw new Error("Invalid SSO assertion");
    const header = decodeJson(parts[0]);
    const claims: Claims = decodeJson(parts[1]);
    const issuer = process.env.MUSIQ_SSO_ISSUER;
    const audience = process.env.MUSIQ_SSO_AUDIENCE;
    const jwksUrl = process.env.MUSIQ_SSO_JWKS_URL;
    if (!issuer || !audience || !jwksUrl) throw new Error("SSO configuration missing");
    if (header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid || header.kid.length > 256) throw new Error("Invalid SSO signature header");
    const now = Math.floor(Date.now() / 1000);
    if (claims.iss !== issuer || !(claims.aud === audience || (Array.isArray(claims.aud) && claims.aud.includes(audience))) ||
      typeof claims.sub !== "string" || !claims.sub || claims.sub.length > 512 ||
      typeof claims.exp !== "number" || claims.exp <= now - 10 || claims.exp > now + 120 ||
      typeof claims.iat !== "number" || claims.iat > now + 10 || claims.iat < now - 180 ||
      (typeof claims.nbf === "number" && claims.nbf > now + 10) ||
      typeof claims.jti !== "string" || !claims.jti || claims.jti.length > 256) {
      throw new Error("SSO claims rejected");
    }
    const url = new URL(jwksUrl);
    if (url.protocol !== "https:" || url.username || url.password || url.hash || url.search || url.origin !== new URL(issuer).origin) {
      throw new Error("SSO JWKS configuration invalid");
    }
    const response = await fetch(url, { signal: AbortSignal.timeout(5000), redirect: "error", cache: "no-store" });
    if (!response.ok) throw new Error("SSO keys unavailable");
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("keys" in data) || !Array.isArray(data.keys)) throw new Error("Invalid JWKS");
    const key = (data.keys as Jwk[]).find(k => k.kid === header.kid && k.kty === "RSA" && (!k.alg || k.alg === "RS256") && (!k.use || k.use === "sig"));
    if (!key) throw new Error("SSO signing key not found");
    const valid = verifySignature("RSA-SHA256", Buffer.from(parts[0] + "." + parts[1]), createPublicKey({ key, format: "jwk" }), Buffer.from(parts[2], "base64url"));
    if (!valid) throw new Error("SSO signature rejected");
    // jti replay protection: createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
    // and unique index on replay_key in the explicit index-provisioning step.
    const db = await getIdentityDb();
    try {
      await db.collection("sso_assertion_replay").insertOne({
        replay_key: issuer + ":" + claims.jti,
        expires_at: new Date((claims.exp + 120) * 1000),
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) throw new Error("SSO assertion already used");
      throw error;
    }
    return { issuer, subject: claims.sub };
  }
}
