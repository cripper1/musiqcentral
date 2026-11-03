"use client";
import { useEffect, useState, type ChangeEvent } from "react";
import styles from "../../dashboard/dashboard.module.css";

type Recording = { channelId: string; recordingId: string; title: string; uploadState: string | null; filename: string | null };
export function ArtistRecordings({ channelId }: { channelId: string }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [title, setTitle] = useState("");
  const [fileError, setFileError] = useState("");
  const [showAudio, setShowAudio] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/artist/recordings", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(typeof body.message === "string" ? body.message : "Could not load recordings.");
        }
        return response.json();
      })
      .then(data => setRecordings((Array.isArray(data.recordings) ? data.recordings : []).filter((r: Recording) => r.channelId === channelId)))
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load recordings."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [channelId]);

  useEffect(() => {
    if (!audioFile) { setAudioUrl(""); return; }
    const url = URL.createObjectURL(audioFile);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  function chooseAudio(event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0]??null;
    setFileError("");
    if(file && !(file.type.startsWith("audio/") || /\.(mp3|wav|flac|m4a|aac|ogg)$/i.test(file.name))){
      setAudioFile(null);setFileError("Choose an audio file (MP3, WAV, FLAC, M4A, AAC, or OGG).");return;
    }
    setAudioFile(file);
    setTitle(file?.name.replace(/\.[^.]+$/,"")??"");
  }

  return <section className={styles.updates}>
    <h2>Music &amp; Recordings</h2>
    <p>Manage your songs and recordings. Choose an upload type to get started.</p>
    <div className={styles.uploadOptions}>
      <article className={styles.uploadOption}>
        <span className={styles.symbol} aria-hidden="true">♫</span>
        <h3>Upload Audio</h3>
        <p>Songs, tracks, and other audio recordings.</p>
        <button type="button" className={styles.signout} aria-expanded={showAudio} onClick={()=>setShowAudio(open=>!open)}>
          {showAudio?"Close Audio Selection":"Select Audio"}
        </button>
      </article>
      <article className={styles.uploadOption}>
        <span className={styles.symbol} aria-hidden="true">▣</span>
        <h3>Upload Video</h3>
        <p>Music videos, performances, and other video content.</p>
        <button type="button" className={styles.signout} disabled>Upgrade required</button>
      </article>
    </div>
    {showAudio && <div className={styles.audioDraft}>
      <h3>Prepare Audio</h3>
      <p>Choose a file and preview it before uploading. This is a local preview only; server upload and storage are not connected yet.</p>
      <p><label htmlFor="artist-audio-file">Audio file</label></p>
      <input id="artist-audio-file" type="file" accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg" onChange={chooseAudio}/>
      {fileError&&<p role="alert" className={styles.error}>{fileError}</p>}
      {audioFile&&<>
        <p><label htmlFor="artist-audio-title">Song title</label></p>
        <input id="artist-audio-title" maxLength={200} value={title} onChange={event=>setTitle(event.target.value)}/>
        <p>{audioFile.name} · {(audioFile.size/1024/1024).toFixed(1)} MB</p>
        {audioUrl&&<audio controls src={audioUrl} className={styles.audioPreview}>Your browser does not support audio playback.</audio>}
        <p role="status">Ready for preview. Nothing has been uploaded or saved.</p>
      </>}
    </div>}
    <h3>Your Recordings</h3>
    {loading ? <p>Loading recordings…</p> : error ? <p role="alert" className={styles.error}>{error}</p> : recordings.length ?
      <ul>{recordings.map(recording => <li key={recording.recordingId}>{recording.title} — {recording.uploadState ?? "Draft"}{recording.filename ? ` (${recording.filename})` : ""}</li>)}</ul> :
      <p>No recordings have been added to this artist space yet.</p>}
  </section>;
}
