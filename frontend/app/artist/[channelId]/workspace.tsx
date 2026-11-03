"use client";
import Link from "next/link";
import { useState } from "react";
import { ArtistProfileEditor } from "./profile-editor";
import styles from "../../dashboard/dashboard.module.css";
import { useArtistSpaces } from "../artist-spaces";
import { ArtistRecordings } from "./recordings";

type View = "overview" | "profile" | "music";
const sections = [
  { title: "Fans & Community", description: "Followers, fan list, and community engagement.", status: "Planned" },
  { title: "Music Analytics", description: "Most played and downloaded songs from verified activity.", status: "Planned" },
  { title: "Fan Messages", description: "Messages to fans who have opted in.", status: "Planned" },
  { title: "Concerts & Events", description: "Shows, venues, and appearances.", status: "Planned" },
  { title: "Tickets", description: "Ticket offerings and sales.", status: "Planned" },
  { title: "Products & Merchandise", description: "Merchandise and artist products.", status: "Planned" },
  { title: "Artist Settings", description: "Artist access and workspace configuration.", status: "Planned" }
] as const;

export function ArtistWorkspace({ channelId }: { channelId: string }) {
  const { spaces, loading, error } = useArtistSpaces();
  const [updatedName,setUpdatedName] = useState("");
  const [view,setView] = useState<View>("overview");
  const space = spaces.find(item => item.channelId === channelId);
  if (loading) return <section className={styles.updates}><p>Loading artist space…</p></section>;
  if (error) return <section className={styles.updates}><p role="alert" className={styles.error}>{error}</p></section>;
  if (!space) return <section className={styles.updates}><h1>Artist space unavailable</h1><p>We could not find this space among the artists you manage.</p><Link href="/artist">All artist spaces</Link></section>;
  return <>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>ARTIST OR BAND SPACE</p>
      <h1>{updatedName || space.name}</h1>
      <p>Manage your artist identity, recordings, audience, and activities.</p>
      <p><Link href="/artist">All artist spaces</Link> · <Link href="/dashboard">Dashboard</Link></p>
    </section>
    {view !== "overview" && <nav className={styles.artistViewNav} aria-label="Artist workspace navigation">
      <button type="button" className={styles.signout} onClick={()=>setView("overview")}>← Artist Workspace</button>
      <button type="button" className={styles.signout} disabled={view==="profile"} onClick={()=>setView("profile")}>Artist Profile</button>
      <button type="button" className={styles.signout} disabled={view==="music"} onClick={()=>setView("music")}>Music &amp; Recordings</button>
    </nav>}
    {view === "profile" && <ArtistProfileEditor channelId={channelId} onSaved={setUpdatedName} />}
    {view === "music" && <ArtistRecordings channelId={channelId} />}
    {view === "overview" && <>
      <section className={styles.updates}>
        <h2>Artist Workspace</h2>
        <p>Choose an area to manage. Your artist profile and recordings have their own dedicated views.</p>
      </section>
      <div className={styles.grid} aria-label="Artist management areas">
        <article className={styles.card}>
          <span className={styles.symbol} aria-hidden="true">♫</span>
          <h2>Artist Profile</h2>
          <p>Manage your artist or band name, biography, primary genre, and musical styles.</p>
          <button type="button" className={styles.signout} onClick={()=>setView("profile")}>Manage Profile</button>
        </article>
        <article className={styles.card}>
          <span className={styles.symbol} aria-hidden="true">♪</span>
          <h2>Music &amp; Recordings</h2>
          <p>Review your recordings and their current upload status. Audio uploads are not yet enabled.</p>
          <button type="button" className={styles.signout} onClick={()=>setView("music")}>Manage Music</button>
        </article>
        {sections.map(section => <article className={styles.card} key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.description}</p>
          <span className={styles.status}>{section.status}</span>
        </article>)}
      </div>
    </>}
  </>;
}
