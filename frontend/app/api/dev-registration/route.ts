import { NextResponse } from "next/server";
export async function POST(request: Request) {
  if (process.env.MUSIQ_ENV !== "development" || process.env.ENABLE_DEV_REGISTRATION !== "true") {
    return NextResponse.json({ message: "DEV registration disabled." }, { status: 404 });
  }
  const backend = process.env.MUSIQ_BACKEND_URL;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  const access = process.env.DEV_DEMO_ACCESS_KEY;
  if (!backend || !secret || !access) return NextResponse.json({ message: "DEV backend not configured." }, { status: 503 });
  if (request.headers.get("x-demo-access-key") !== access) return NextResponse.json({ message: "Invalid demo access key." }, { status: 403 });
  try {
    const response = await fetch(new URL("/dev/registration", backend), {
      method: "POST",
      headers: { "content-type": "application/json", "x-dev-registration-secret": secret },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ message: "Database registration failed; check backend logs." }, { status: 503 });
    const result: unknown = await response.json();
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ message: "DEV registration backend unavailable." }, { status: 503 });
  }
}
