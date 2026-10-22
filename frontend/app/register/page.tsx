"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

type State = "idle" | "working" | "success" | "error";

export default function RegisterPage() {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const signInUrl = process.env.NEXT_PUBLIC_MUSIQ_SSO_URL;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!code.trim()) return;
    setState("working");
    setMessage("Verifying your MusIQ Network sign-in…");
    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assertion: code.trim() }),
        cache: "no-store",
      });
      const body: { message?: string } = await response.json();
      setState(response.ok ? "success" : "error");
      setMessage(body.message ?? (response.ok ? "Your account is ready." : "Registration could not be completed."));
      if (response.ok) setCode("");
    } catch {
      setState("error");
      setMessage("Unable to reach the registration service. Please try again.");
    }
  }

  return <main className={styles.shell}>
    <div className={styles.panel}>
      <Link href="/" className={styles.logo}><Image src="/musiq-central-logo.png" alt="MusIQ Central" width={210} height={158} unoptimized /></Link>
      <p className={styles.eyebrow}>WELCOME TO MUSIQ CENTRAL</p>
      <h1>One account. Every experience.</h1>
      <p className={styles.intro}>Join the community connecting artists, fans and the future of music. No artist or fan designation required to get started.</p>
      {signInUrl ? <a className={styles.primary} href={signInUrl}>Continue with MusIQ Network <span aria-hidden="true">→</span></a> :
        <div className={styles.notice} role="status">MusIQ Network sign-in is being connected. Registration will open when verified sign-in is available.</div>}
      <details className={styles.details}>
        <summary>Have a verified sign-in assertion?</summary>
        <p>For authorized integration testing only. An assertion must be issued and signed by MusIQ Network.</p>
        <form onSubmit={submit}>
          <label htmlFor="assertion">Verified sign-in assertion</label>
          <textarea id="assertion" value={code} onChange={e => setCode(e.target.value)} rows={3} required autoComplete="off" placeholder="Paste your signed sign-in assertion" />
          <button type="submit" disabled={state === "working"}>{state === "working" ? "Verifying…" : "Complete registration"}</button>
        </form>
      </details>
      {message && <div role="status" aria-live="polite" className={state === "success" ? styles.success : state === "error" ? styles.error : styles.notice}>{message}</div>}
      <p className={styles.back}><Link href="/">← Back to MusIQ Central</Link></p>
    </div>
  </main>;
}
