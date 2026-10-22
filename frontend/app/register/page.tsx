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
  const signInUrl = process.env.NEXT_PUBLIC_MUSIQ_SSO_URL;

  function demonstrate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      <div className={styles.notice} role="note"><strong>Interactive workflow preview.</strong> This demonstration does not write to PostgreSQL or MongoDB, authenticate a person, or award real LYRIQ tokens. Database verification shown below is illustrative, not a live check.</div>
      <form onSubmit={demonstrate} className={styles.details}>
        <label htmlFor="display-name">Display name for demonstration</label>
        <input id="display-name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} placeholder="Enter a demonstration name" style={{width:"100%",padding:14,borderRadius:9,background:"#091421",color:"white",border:"1px solid #52627a",margin:"10px 0 20px"}} />
        <label htmlFor="external-result">Simulate Block Reign / Noty response</label>
        <select id="external-result" value={outcome} onChange={e => setOutcome(e.target.value as Outcome)} style={{width:"100%",padding:14,borderRadius:9,background:"#091421",color:"white",border:"1px solid #52627a",margin:"10px 0 20px"}}>
          <option value="success">Success — example 5 LYRIQ tokens</option>
          <option value="failure">Failure — integration error</option>
        </select>
        <button type="submit" onClick={() => {setFinished(false);setSteps([]);}}>Run registration demonstration</button>
      </form>
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
