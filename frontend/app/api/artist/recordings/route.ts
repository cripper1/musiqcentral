import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const backend = process.env.MUSIQ_BACKEND_URL;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  const token = (await cookies()).get("musiq_session")?.value;
  if (!backend || !secret || process.env.MUSIQ_ENV !== "development" || process.env.ENABLE_DEV_REGISTRATION !== "true")
    return NextResponse.json({ message: "Artist service unavailable." }, { status: 503 });
  if (!token) return NextResponse.json({ message: "Not signed in." }, { status: 401 });
  try {
    const response = await fetch(new URL("/dev/artist/recordings", backend), {
      headers: { "x-dev-registration-secret": secret, "x-dev-session": token },
      cache: "no-store", signal: AbortSignal.timeout(15000)
    });
    return NextResponse.json(await response.json(), { status: response.status, headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "Artist service unavailable." }, { status: 503 });
  }
}
