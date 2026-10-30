"use client";
import { useEffect, useState } from "react";
import styles from "../../dashboard/dashboard.module.css";

type Recording = { channelId: string; recordingId: string; title: string; uploadState: string | null; filename: string | null };
export function ArtistRecordings({ channelId }: { channelId: string }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/artist/recordings", { cache: "no-store", signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error("Could not load recordings."); return response.json(); })
      .then(data => setRecordings((Array.isArray(data.recordings) ? data.recordings : []).filter((r: Recording) => r.channelId === channelId)))
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load recordings."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [channelId]);
  return <section className={styles.updates}>
    <h2>Songs &amp; Recordings</h2>
    {loading ? <p>Loading recordings…</p> : error ? <p role="alert" className={styles.error}>{error}</p> : recordings.length ?
      <ul>{recordings.map(recording => <li key={recording.recordingId}>{recording.title} — {recording.uploadState ?? "Draft"}{recording.filename ? ` (${recording.filename})` : ""}</li>)}</ul> :
      <p>No recordings have been added to this artist space yet.</p>}
    <p>Audio upload and per-song genre classification will become available when their storage and catalog services are connected.</p>
  </section>;
}
