import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const backend = process.env.MUSIQ_BACKEND_URL;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  if (!backend || !secret || process.env.MUSIQ_ENV !== "development" || process.env.ENABLE_DEV_REGISTRATION !== "true") {
    return NextResponse.json({ message: "Registration provider is not configured." }, { status: 503 });
  }
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object" || !("name" in body) || !("email" in body)) {
    return NextResponse.json({ message: "Invalid registration fields." }, { status: 400 });
  }
  try {
    const upstream = await fetch(new URL("/dev/onboarding", backend), {
      method: "POST", headers: { "content-type": "application/json", "x-dev-registration-secret": secret },
      body: JSON.stringify({ ...body, decision: "approved" }), cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    const data = await upstream.json();
    if (!upstream.ok) return NextResponse.json({ message: typeof data?.message === "string" ? data.message : "Registration failed." }, { status: upstream.status });
    const { sessionToken, expiresAt } = data;
    if (typeof sessionToken !== "string" || typeof expiresAt !== "string") throw new Error("Missing session");
    const result = NextResponse.json({ message: data.message, demo: data.demo, registration: data.registration, verified: data.verified }, { headers: { "cache-control": "no-store" } });
    result.cookies.set("musiq_session", sessionToken, { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: new Date(expiresAt) });
    return result;
  } catch {
    return NextResponse.json({ message: "Registration backend unavailable or session creation failed." }, { status: 503 });
  }
}

export async function GET() {
  const backend = process.env.MUSIQ_BACKEND_URL;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  const token = (await cookies()).get("musiq_session")?.value;
  if (!backend || !secret || !token) return NextResponse.json({ signedIn: false }, { status: 401 });
  try {
    const upstream = await fetch(new URL("/dev/session", backend), {
      headers: { "x-dev-registration-secret": secret, "x-dev-session": token },
      cache: "no-store", signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) return NextResponse.json({ signedIn: false }, { status: 401 });
    return NextResponse.json(await upstream.json(), { headers: { "cache-control": "no-store" } });
  } catch { return NextResponse.json({ signedIn: false }, { status: 503 }); }
}

export async function DELETE() {
  const backend = process.env.MUSIQ_BACKEND_URL;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  const token = (await cookies()).get("musiq_session")?.value;
  if (!backend || !secret || !token) return NextResponse.json({ signedIn: false }, { status: 401 });
  try {
    const upstream = await fetch(new URL("/dev/session", backend), {
      method: "DELETE",
      headers: { "x-dev-registration-secret": secret, "x-dev-session": token },
      cache: "no-store", signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) return NextResponse.json({ message: "Sign-out failed." }, { status: 503 });
    const result = NextResponse.json({ signedIn: false }, { headers: { "cache-control": "no-store" } });
    result.cookies.delete("musiq_session");
    return result;
  } catch { return NextResponse.json({ message: "Sign-out unavailable." }, { status: 503 }); }
}
