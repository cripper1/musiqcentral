"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

type RegistrationResult = {
  message: string;
  partyId?: string;
  accountId?: string;
  database?: { postgres: string; mongo: string; account: string };
  external?: { status: string };
};

export default function RegisterPage() {
  const [accessKey, setAccessKey] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const signInUrl = process.env.NEXT_PUBLIC_MUSIQ_SSO_URL;

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRunning(true);
    setResult(null);
    setSucceeded(false);
    try {
      const response = await fetch("/api/dev-registration", {
        method: "POST",
        headers: { "content-type": "application/json", "x-demo-access-key": accessKey },
        body: JSON.stringify({}),
        cache: "no-store",
      });
      const data: RegistrationResult = await response.json();
      setResult(data);
      setSucceeded(response.ok);
    } catch {
      setResult({ message: "The development registration service could not be reached." });
    } finally {
      setRunning(false);
    }
  }

  return <main className={styles.shell}>
    <div className={styles.panel}>
      <Link href="/" className={styles.logo}>
        <Image src="/musiq-central-logo.png" alt="MusIQ Central" width={210} height={158} unoptimized />
      </Link>
      <p className={styles.eyebrow}>MUSIQ CENTRAL · DEVELOPMENT</p>
      <h1>Register and verify.</h1>
      <p className={styles.intro}>Create a real development account in PostgreSQL and MongoDB, then verify the records written.</p>
      <div className={styles.notice}>This page uses the actual DEV registration service. No simulated responses or token awards. MusIQ Network authentication and Block Reign/Noty rewards are not yet connected.</div>
      <form onSubmit={register} className={styles.details}>
        <label htmlFor="access-key">Development access key</label>
        <input id="access-key" type="password" value={accessKey} onChange={e => setAccessKey(e.target.value)}
          required autoComplete="off" style={{width:"100%",padding:14,borderRadius:9,background:"#091421",color:"white",border:"1px solid #52627a",margin:"10px 0 20px"}} />
        <button type="submit" disabled={running}>{running ? "Writing and verifying databases…" : "Create and verify DEV registration"}</button>
      </form>
      {result && <div role="status" aria-live="polite" className={succeeded ? styles.success : styles.error}>
        <strong>{succeeded ? "Registration verified" : "Registration failed"}</strong>
        <p>{result.message}</p>
        {succeeded && <div>
          <p>Party: {result.partyId} · Account: {result.accountId}</p>
          <p>PostgreSQL: {result.database?.postgres} · MongoDB: {result.database?.mongo} · Account: {result.database?.account}</p>
          <p>Block Reign / Noty: {result.external?.status ?? "not connected"}</p>
        </div>}
      </div>}
      {signInUrl && <a className={styles.primary} href={signInUrl}>Continue with MusIQ Network →</a>}
      <p className={styles.back}><Link href="/">← Back to MusIQ Central</Link></p>
    </div>
  </main>;
}
