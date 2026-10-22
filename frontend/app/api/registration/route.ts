import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const api = process.env.MUSIQ_BACKEND_URL;
  if (!api) return NextResponse.json({ message: "Registration is not yet connected to the MusIQ Central service." }, { status: 503 });
  let assertion: unknown;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("assertion" in body)) throw new Error("Invalid request");
    assertion = body.assertion;
  } catch {
    return NextResponse.json({ message: "Invalid registration request." }, { status: 400 });
  }
  if (typeof assertion !== "string" || assertion.length > 8192 || !assertion.trim()) {
    return NextResponse.json({ message: "A valid sign-in assertion is required." }, { status: 400 });
  }
  try {
    const response = await fetch(new URL("/registration", api), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ assertion }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    return NextResponse.json(
      { message: response.ok ? "Your MusIQ Central account is ready." : "Registration could not be completed. Please try again." },
      { status: response.ok ? 200 : response.status >= 500 ? 503 : 400 },
    );
  } catch {
    return NextResponse.json({ message: "Registration service is temporarily unavailable." }, { status: 503 });
  }
}
