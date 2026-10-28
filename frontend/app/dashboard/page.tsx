import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./dashboard.module.css";
import { SignOut } from "./sign-out";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("musiq_session")?.value;
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
  } catch { /* Fail closed when session cannot be verified. */ }
  if (!authenticated) redirect("/register");

  return <main className={styles.shell}>
    <header className={styles.header}>
      <Link href="/" aria-label="MusIQ Central public home"><Image src="/musiq-central-logo.png" alt="MusIQ Central" width={138} height={104} unoptimized /></Link>
      <nav aria-label="Dashboard navigation"><span className={styles.active}>Dashboard</span><Link href="/">Public home</Link><SignOut /></nav>
    </header>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>YOUR MUSIQ CENTRAL</p>
      <h1>Welcome to your music.</h1>
      <p>One account. Discover music as a fan, and build your presence as an artist or band.</p>
    </section>
    <section className={styles.grid} aria-label="Music Central experiences">
      <article className={styles.card}><span className={styles.symbol}>♫</span><h2>Discover Music</h2><p>Find artists, releases and new sounds. Discovery opens as artists begin publishing.</p><span className={styles.status}>Coming next</span></article>
      <article className={styles.card}><span className={styles.symbol}>✦</span><h2>My Artist Channel</h2><p>Create your artist or band presence, add recordings, and publish music.</p><span className={styles.status}>Coming next</span></article>
      <article className={styles.card}><span className={styles.symbol}>◉</span><h2>My Identity</h2><p>Your single account will support fan, artist and band participation without separate logins.</p><span className={styles.status}>Planned</span></article>
    </section>
    <section className={styles.updates}><h2>Recently added music</h2><p>Published recordings will appear here when the catalog is connected. No demo tracks are presented as real releases.</p></section>
    <footer className={styles.footer}>DEV environment · Network identity verification is simulated.</footer>
  </main>;
}
