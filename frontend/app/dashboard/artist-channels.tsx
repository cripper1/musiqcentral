"use client";
import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";

type Channel={channelId:string;name:string};
export function ArtistChannels(){
  const [channels,setChannels]=useState<Channel[]>([]);
  const [name,setName]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{let active=true;fetch("/api/artist/channels",{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error("Could not load artist channels.");return r.json();}).then(data=>{if(active)setChannels(data.channels??[]);}).catch(()=>{if(active)setError("Artist channels could not be loaded.");});return()=>{active=false;};},[]);
  async function create(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;setBusy(true);setError("");
    try{
      const response=await fetch("/api/artist/channels",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:name.trim()})});
      const data=await response.json();if(!response.ok)throw Error(data.message??"Could not create artist channel.");
      setChannels(previous=>[...previous,data.channel]);setName("");
    }catch(e){setError(e instanceof Error?e.message:"Could not create artist channel.");}
    finally{setBusy(false);}
  }
  return <article className={styles.card}><span className={styles.symbol}>✦</span><h2>My Artist Channel</h2>
    {channels.length? <ul>{channels.map(channel=><li key={channel.channelId}>{channel.name}</li>)}</ul>:<p>Create your artist or band presence.</p>}
    <form onSubmit={create}><label htmlFor="artist-channel-name">Artist or band name</label><input id="artist-channel-name" value={name} onChange={event=>setName(event.target.value)} maxLength={120} required disabled={busy}/><button type="submit" disabled={busy||!name.trim()}>{busy?"Saving…":"Create artist channel"}</button></form>
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    <span className={styles.status}>Private recording upload is next</span>
  </article>;
}
