"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "../dashboard/dashboard.module.css";

export type ArtistSpace = { channelId: string; name: string };

export function useArtistSpaces() {
  const [spaces, setSpaces] = useState<ArtistSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/artist/channels", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Artist spaces could not be loaded.");
        return response.json();
      })
      .then(data => setSpaces(Array.isArray(data.channels) ? data.channels : []))
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Artist spaces could not be loaded."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return { spaces, loading, error };
}

export function ArtistSpaces() {
  const { spaces, loading, error } = useArtistSpaces();
  return <section className={styles.updates} aria-label="Your artist and band spaces">
    <h2>Your artist and band spaces</h2>
    <p>Each space has its own music, audience, and future events and products. Select a space to manage it.</p>
    {loading && <p>Loading your spaces…</p>}
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {!loading && !error && spaces.length === 0 && <p>You haven't created an artist or band space yet.</p>}
    {!loading && !error && spaces.length > 0 && <ul>{spaces.map(space =>
      <li key={space.channelId}><Link href={`/artist/${encodeURIComponent(space.channelId)}`}>{space.name}</Link></li>
    )}</ul>}
    <p><Link href="/artist/new">Create an Artist or Band Space</Link></p>
  </section>;
}
