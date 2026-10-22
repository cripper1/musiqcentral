"use client";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [decision, setDecision] = useState<"approved" | "denied">("approved");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage("");
    try {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), decision }),
        cache: "no-store"
      });
      const result: { message?: string } = await response.json();
      setMessage(result.message ?? (response.ok ? "Your account has been created." : "Registration failed."));
      if (response.ok) setResult(result as Record<string, unknown>);
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
    <p className={styles.intro}>Join MusIQ Central to discover music, follow artists and connect with the community.</p>
    {!complete && <form className={styles.details} onSubmit={submit}>
      <label htmlFor="full-name">Your name</label>
      <input id="full-name" type="text" autoComplete="name" required maxLength={120} value={name} onChange={e => setName(e.target.value)} />
      <label htmlFor="email">Email address</label>
      <input id="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} />
      <details className={styles.details}><summary>Identity integration demonstration</summary><p>The network identity response is simulated. Registration and database operations are real.</p><label htmlFor="identity-decision">Provider response</label><select id="identity-decision" value={decision} onChange={e=>setDecision(e.target.value as "approved" | "denied")}><option value="approved">Approve identity</option><option value="denied">Deny identity</option></select></details>
      <button type="submit" disabled={working}>{working ? "Creating your account…" : "Create account"}</button>
    </form>}
    {message && <div role="status" aria-live="polite" className={complete ? styles.success : styles.error}>{message}</div>}
    {result && <details open className={styles.details}><summary>Registration verification</summary><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{JSON.stringify(result,null,2)}</pre></details>}
    <p className={styles.back}><Link href="/">← Back to MusIQ Central</Link></p>
  </div></main>;
}
