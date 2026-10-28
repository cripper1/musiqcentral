"use client";
import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    void fetch("/api/registration", { cache: "no-store" }).then(response => {
      if (response.ok) { setComplete(true); setMessage("You are signed in."); }
    }).catch(() => undefined);
  }, []);

  async function signOut() {
    setWorking(true);
    try {
      const response = await fetch("/api/registration", { method: "DELETE", cache: "no-store" });
      if (!response.ok) { setMessage("Could not sign out. Please try again."); return; }
      setComplete(false); setMessage("You have signed out.");
    } catch { setMessage("Could not sign out. Please try again."); }
    finally { setWorking(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage("");
    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
        cache: "no-store"
      });
      const result: { message?: string } = await response.json();
      setMessage(result.message ?? (response.ok ? "Your account has been created." : "Registration failed."));
      if (response.ok) {
        setComplete(true);

      }
    } catch {
      setMessage("Registration could not be completed. Please try again.");
    } finally {
      setWorking(false);
    }
  }

  return <main className={styles.shell}><div className={styles.panel}>
    <Link href="/" className={styles.logo}><Image src="/musiq-central-logo.png" alt="MusIQ Central" width={210} height={158} unoptimized /></Link>
    <p className={styles.eyebrow}>WELCOME TO MUSIQ CENTRAL</p>
    <h1>Create your account</h1>
    <p className={styles.intro}>Join MusIQ Central to discover music, follow artists and connect with the community.</p>\n    <p className={styles.intro}>DEV environment: network identity verification is simulated. Do not use a real account or password.</p>
    {!complete && <form className={styles.details} onSubmit={submit}>
      <label htmlFor="full-name">Your name</label>
      <input id="full-name" type="text" autoComplete="name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} />
      <label htmlFor="email">Email address</label>
      <input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} />
      <button type="submit" disabled={working}>{working ? "Creating your account…" : "Create account"}</button>
    </form>}
    {message && <div role="status" aria-live="polite" className={complete ? styles.success : styles.error}>{message}</div>}
    {complete && <button type="button" disabled={working} onClick={signOut}>Sign out</button>}
    <p className={styles.back}><Link href="/">← Back to MusIQ Central</Link></p>
  </div></main>;
}
