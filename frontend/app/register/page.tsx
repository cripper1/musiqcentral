"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./register.module.css";

type Outcome = "success" | "failure";
type Step = { title: string; detail: string; ok: boolean };
const base: Step[] = [
  { title: "PostgreSQL — Party and Account", detail: "Pending account created", ok: true },
  { title: "MongoDB — Identity mapping", detail: "Identity linked to account", ok: true },
  { title: "Registration verification", detail: "Database records checked", ok: true },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("success");
  const [steps, setSteps] = useState<Step[]>([]);
  const [finished, setFinished] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [running, setRunning] = useState(false);
  const [liveResult, setLiveResult] = useState("");
  const signInUrl = process.env.NEXT_PUBLIC_MUSIQ_SSO_URL;

  async function demonstrate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRunning(true);
    setFinished(false);
    setLiveResult("");
    try {
      const response = await fetch("/api/dev-registration", { method: "POST", headers: { "content-type": "application/json", "x-demo-access-key": accessKey }, body: JSON.stringify({ outcome }) });
      const data: { message?: string; accountId?: string; partyId?: string; database?: { postgres: string; mongo: string; account: string }; external?: { success: boolean; exampleLyriq: number } } = await response.json();
      if (!response.ok) { setLiveResult(data.message ?? "Registration failed."); return; }
      setLiveResult(`LIVE DATABASE VERIFIED — Party ${data.partyId}, Account ${data.accountId}. PostgreSQL: ${data.database?.postgres}; MongoDB: ${data.database?.mongo}. External result: ${data.external?.success ? "simulated success" : "simulated failure"}. Example LYRIQ: ${data.external?.exampleLyriq ?? 0} (not issued).`);
      setFinished(true);
    } catch { setLiveResult("Could not connect to the development registration service."); }
    finally { setRunning(false); }
    /* Existing visual-only simulation is retained below as documentation, not executed. */
    return;
    setSteps([...base, outcome === "success"
      ? { title: "Block Reign / Noty — simulated response", detail: "Integration accepted; example reward: 5 LYRIQ tokens", ok: true }
      : { title: "Block Reign / Noty — simulated response", detail: "Integration rejected; no rewards issued", ok: false },
    ]);
    setFinished(true);
  }

  return <main className={styles.shell}>
    <div className={styles.panel}>
      <Link href="/" className={styles.logo}><Image src="/musiq-central-logo.png" alt="MusIQ Central" width={210} height={158} unoptimized /></Link>
      <p className={styles.eyebrow}>MUSIQ CENTRAL · DEVELOPMENT DEMONSTRATION</p>
      <h1>One account. Every experience.</h1>
      <p className={styles.intro}>See the planned registration and rewards journey before the external network integration is complete.</p>
      <div className={styles.notice} role="note"><strong>Interactive workflow preview.</strong> When the DEV backend is configured, this demonstration creates and verifies real PostgreSQL and MongoDB records. Only the Block Reign/Noty response and LYRIQ reward are simulated. No real authentication or tokens are issued.</div>
      <form onSubmit={demonstrate} className={styles.details}>
        <label htmlFor="access-key">Development demonstration access key</label>
        <input id="access-key" type="password" value={accessKey} onChange={e => setAccessKey(e.target.value)} required autoComplete="off" style={{width:"100%",padding:14,borderRadius:9,background:"#091421",color:"white",border:"1px solid #52627a",margin:"10px 0 20px"}} />
        <label htmlFor="display-name">Display name for demonstration</label>
        <input id="display-name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} placeholder="Enter a demonstration name" style={{width:"100%",padding:14,borderRadius:9,background:"#091421",color:"white",border:"1px solid #52627a",margin:"10px 0 20px"}} />
        <label htmlFor="external-result">Simulate Block Reign / Noty response</label>
        <select id="external-result" value={outcome} onChange={e => setOutcome(e.target.value as Outcome)} style={{width:"100%",padding:14,borderRadius:9,background:"#091421",color:"white",border:"1px solid #52627a",margin:"10px 0 20px"}}>
          <option value="success">Success — example 5 LYRIQ tokens</option>
          <option value="failure">Failure — integration error</option>
        </select>
        <button type="submit" disabled={running}>{running ? "Writing and verifying DEV databases…" : "Run real DEV registration"}</button>
      </form>
      {liveResult && <div className={liveResult.startsWith("LIVE DATABASE") ? styles.success : styles.error} role="status" aria-live="polite">{liveResult}</div>}
      {finished && <section aria-live="polite" style={{marginTop:22}}>
        <h2 style={{fontSize:19,marginBottom:14}}>Demonstration results for {name}</h2>
        {steps.map((step,i) => <div key={i} className={step.ok ? styles.success : styles.error} style={{marginTop:9}}>
          <strong>{step.ok ? "✓" : "✕"} {step.title}</strong><div style={{marginTop:5,fontSize:13}}>{step.detail} · Simulated</div>
        </div>)}
        <div className={outcome === "success" ? styles.success : styles.error} role="status">
          <strong>{outcome === "success" ? "Registration demonstration succeeded" : "External integration demonstration failed"}</strong>
          <p>{outcome === "success" ? "Example reward: You've earned 5 LYRIQ tokens (simulation only)." : "Example: registration requires attention; no reward recorded."}</p>
        </div>
      </section>}
      {signInUrl && <a className={styles.primary} style={{marginTop:24}} href={signInUrl}>Continue with MusIQ Network →</a>}
      <p className={styles.back}><Link href="/">← Back to MusIQ Central</Link></p>
    </div>
  </main>;
}
