"use client";
import Link from "next/link";
import styles from "../../dashboard/dashboard.module.css";
import { useArtistSpaces } from "../artist-spaces";
import { ArtistRecordings } from "./recordings";

const sections = [
  { title: "Artist Profile", description: "Performing name, genres, biography, and artwork.", status: "Profile editing next" },
  { title: "Music Analytics", description: "Most played and downloaded songs from verified activity.", status: "Planned" },
  { title: "Fans & Community", description: "Followers, fan list, and community engagement.", status: "Planned" },
  { title: "Fan Messages", description: "Messages to fans who have opted in.", status: "Planned" },
  { title: "Concerts & Events", description: "Shows, venues, and appearances.", status: "Planned" },
  { title: "Tickets", description: "Ticket offerings and sales.", status: "Planned" },
  { title: "Products & Merchandise", description: "Merchandise and artist products.", status: "Planned" },
  { title: "Artist Settings", description: "Artist access and workspace configuration.", status: "Planned" }
] as const;

export function ArtistWorkspace({ channelId }: { channelId: string }) {
  const { spaces, loading, error } = useArtistSpaces();
  const space = spaces.find(item => item.channelId === channelId);
  if (loading) return <section className={styles.updates}><p>Loading artist space…</p></section>;
  if (error) return <section className={styles.updates}><p role="alert" className={styles.error}>{error}</p></section>;
  if (!space) return <section className={styles.updates}><h1>Artist space unavailable</h1><p>We could not find this space among the artists you manage.</p><Link href="/artist">All artist spaces</Link></section>;
  return <>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>ARTIST OR BAND SPACE</p>
      <h1>{space.name}</h1>
      <p>Manage your artist identity, recordings, audience, and activities.</p>
      <p><Link href="/artist">All artist spaces</Link> · <Link href="/dashboard">Dashboard</Link></p>
    </section>
    <section className={styles.updates}><h2>Overview</h2><p>Your artist space is active. Plays, downloads, fans, and sales will display when real activity data is available.</p></section>
    <ArtistRecordings channelId={channelId} />
    <section className={styles.grid} aria-label="Artist management areas">
      {sections.map(section => <article className={styles.card} key={section.title}>
        <h2>{section.title}</h2><p>{section.description}</p><span className={styles.status}>{section.status}</span>
      </article>)}
    </section>
  </>;
}
