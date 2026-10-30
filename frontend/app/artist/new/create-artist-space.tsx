"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../dashboard/dashboard.module.css";

export function CreateArtistSpace() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/artist/channels", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await response.json();
      if (!response.ok || !data.channel?.channelId) throw new Error(data.message ?? "Could not create artist space.");
      router.push(`/artist/${encodeURIComponent(data.channel.channelId)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create artist space.");
    } finally { setBusy(false); }
  }
  return <section className={styles.updates}>
    <h2>Start with your performing name</h2>
    <p>This is the name listeners will use to find your music. You can create separate spaces for a solo act, band, or another musical project.</p>
    <form onSubmit={create}>
      <p><label htmlFor="artist-space-name">Artist or band name</label></p>
      <p><input id="artist-space-name" name="name" value={name} onChange={event => setName(event.target.value)} maxLength={120} required disabled={busy} autoComplete="off" /></p>
      <p><button className={styles.signout} type="submit" disabled={busy || !name.trim()}>{busy ? "Creating…" : "Create Artist or Band Space"}</button></p>
    </form>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <p>Genre selection, artist biography, and artwork will be added as their real editing capabilities are connected.</p>
    <p><Link href="/artist">Back to your spaces</Link></p>
  </section>;
}
