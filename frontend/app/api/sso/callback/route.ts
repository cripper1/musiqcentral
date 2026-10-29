import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Network SSO integration boundary. Not enabled until Cory confirms the
// handoff method, issuer/JWKS/audience and callback registration.
// This endpoint deliberately does not issue an application session.
export async function POST(request: Request) {
  if (process.env.ENABLE_NETWORK_SSO !== "true") {
    return NextResponse.json({ message: "Network SSO is not enabled." }, { status: 503 });
  }
  const backend = process.env.MUSIQ_BACKEND_URL;
  if (!backend) return NextResponse.json({ message: "Network SSO is not configured." }, { status: 503 });
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return NextResponse.json({ message: "Unsupported SSO handoff." }, { status: 415 });
  }
  if (Number(request.headers.get("content-length") ?? "0") > 12000) {
    return NextResponse.json({ message: "SSO response too large." }, { status: 413 });
  }
  let form: FormData;
  try { form = await request.formData(); } catch {
    return NextResponse.json({ message: "Invalid SSO response." }, { status: 400 });
  }
  // Exact field names and state flow must be confirmed with Network.
  const assertion = form.get("assertion");
  const state = form.get("state");
  const expectedState = (await cookies()).get("musiq_sso_state")?.value;
  if (typeof assertion !== "string" || assertion.length < 1 || assertion.length > 8192 ||
      typeof state !== "string" || !expectedState || state !== expectedState) {
    return NextResponse.json({ message: "Invalid SSO state or assertion." }, { status: 400 });
  }
  try {
    const upstream = await fetch(new URL("/registration", backend), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assertion }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) return NextResponse.json({ message: "Network sign-in could not be completed." }, { status: 401 });
    // Registration alone is not a login session. Do not redirect to dashboard.
    const response = NextResponse.json({
      message: "Network identity verified and application account provisioned.",
      sessionEstablished: false,
      nextStep: "Network-backed session exchange must be implemented before enabling login.",
    }, { headers: { "cache-control": "no-store" } });
    response.cookies.delete("musiq_sso_state");
    return response;
  } catch {
    return NextResponse.json({ message: "SSO service unavailable." }, { status: 503 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "SSO callback requires a verified provider POST handoff." }, { status: 405 });
}
