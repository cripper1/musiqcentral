"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./dashboard.module.css";

export function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signOut() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/registration", { method: "DELETE", cache: "no-store" });
      if (!response.ok) throw new Error("Sign-out failed");
      router.replace("/register");
      router.refresh();
    } catch { setError("Sign-out failed. Please retry."); setBusy(false); }
  }
  return <><button className={styles.signout} onClick={signOut} disabled={busy}>{busy ? "Signing out…" : "Sign out"}</button>{error && <span role="alert" className={styles.error}>{error}</span>}</>;
}
