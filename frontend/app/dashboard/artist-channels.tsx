"use client";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useArtistSpaces } from "../artist/artist-spaces";

export function ArtistChannels() {
  const { spaces, loading, error } = useArtistSpaces();
  return <article className={styles.card}>
    <span className={styles.symbol}>✦</span>
    <h2>My Artist or Band Spaces</h2>
    <p>Manage your artist identity, songs, fans, concerts, tickets, and products in your dedicated workspace.</p>
    {loading ? <p>Loading artist spaces…</p> : error ? <p role="alert" className={styles.error}>{error}</p> : <p>{spaces.length} artist or band {spaces.length === 1 ? "space" : "spaces"}</p>}
    <p><Link href="/artist">Manage artist spaces</Link></p>
    <span className={styles.status}><Link href="/artist/new">Create an Artist or Band Space</Link></span>
  </article>;
}
