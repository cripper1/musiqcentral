"use client";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    setWorking(true);
    setMessage("");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        cache: "no-store"
      });
      const result: { message?: string } = await response.json();
      setMessage(result.message ?? (response.ok ? "Your account has been created." : "Registration failed."));
      if (response.ok) {
        setComplete(true);
        setPassword("");
        setConfirm("");
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
      <label htmlFor="password">Password</label>
      <input id="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} />
      <label htmlFor="confirm">Confirm password</label>
      <input id="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirm} onChange={e => setConfirm(e.target.value)} />
      <button type="submit" disabled={working}>{working ? "Creating your account…" : "Create account"}</button>
    </form>}
    {message && <div role="status" aria-live="polite" className={complete ? styles.success : styles.error}>{message}</div>}
    <p className={styles.back}><Link href="/">← Back to MusIQ Central</Link></p>
  </div></main>;
}
