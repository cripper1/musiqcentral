import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ArtistLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get("musiq_session")?.value;
  const backend = process.env.MUSIQ_BACKEND_URL;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  if (!token || !backend || !secret || process.env.MUSIQ_ENV !== "development" || process.env.ENABLE_DEV_REGISTRATION !== "true") redirect("/register");
  let authenticated = false;
  try {
    const response = await fetch(new URL("/dev/session", backend), {
      headers: { "x-dev-registration-secret": secret, "x-dev-session": token },
      cache: "no-store", signal: AbortSignal.timeout(12000)
    });
    authenticated = response.ok && (await response.json()).signedIn === true;
  } catch { /* Fail closed. */ }
  if (!authenticated) redirect("/register");
  return children;
}
