"use client";
import { useEffect, useState, type FormEvent } from "react";
import styles from "../../dashboard/dashboard.module.css";

type Genre = {genreId:string;code:string;name:string;kind:"genre"|"style"};
type Profile = {channelId:string;name:string;biography:string;genreIds:string[]};

export function ArtistProfileEditor({channelId,onSaved}:{channelId:string;onSaved:(name:string)=>void}){
  const [genres,setGenres]=useState<Genre[]>([]);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setError("");setProfile(null);
    Promise.all([
      fetch(`/api/artist/channels/${encodeURIComponent(channelId)}/profile`,{cache:"no-store",signal:controller.signal}),
      fetch("/api/music/genres",{cache:"no-store",signal:controller.signal})
    ]).then(async ([p,g])=>{
      if(!p.ok||!g.ok)throw new Error("Could not load artist profile or music categories.");
      const [pd,gd]=await Promise.all([p.json(),g.json()]);
      if(!pd.profile||!Array.isArray(gd.genres))throw new Error("Invalid artist profile response.");
      setProfile(pd.profile);
      setGenres(gd.genres);
    }).catch(err=>{if(!controller.signal.aborted)setError(err instanceof Error?err.message:"Could not load profile.");})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[channelId]);

  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!profile||saving)return;
    setSaving(true);setError("");setMessage("");
    try{
      const response=await fetch(`/api/artist/channels/${encodeURIComponent(channelId)}/profile`,{
        method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({
          name:profile.name,biography:profile.biography,genreIds:profile.genreIds
        })
      });
      const result=await response.json();
      if(!response.ok||!result.profile)throw new Error(result.message??"Could not save artist profile.");
      setProfile(result.profile);onSaved(result.profile.name);setMessage("Artist profile saved.");
    }catch(err){setError(err instanceof Error?err.message:"Could not save artist profile.");}
    finally{setSaving(false);}
  }
  function toggle(genreId:string,checked:boolean){
    setProfile(current=>current?{...current,genreIds:checked?
      [...current.genreIds,genreId]:current.genreIds.filter(id=>id!==genreId)}:current);
    setMessage("");
  }
  return <section className={styles.updates} aria-label="Artist profile">
    <h2>Artist Profile</h2>
    {loading&&<p>Loading artist profile…</p>}
    {error&&<p role="alert" className={styles.error}>{error}</p>}
    {profile&&!loading&&<form onSubmit={save}>
      <p><label htmlFor="artist-performing-name">Artist or band name</label></p>
      <p><input id="artist-performing-name" value={profile.name} maxLength={120} required disabled={saving}
        onChange={event=>setProfile({...profile,name:event.target.value})}/></p>
      <p><label htmlFor="artist-biography">Biography</label></p>
      <p><textarea id="artist-biography" rows={5} maxLength={5000} disabled={saving}
        value={profile.biography} onChange={event=>setProfile({...profile,biography:event.target.value})}/></p>
      <fieldset disabled={saving}>
        <legend>Music genres and styles</legend>
        <p>Select up to 20 classifications. These are managed by MusIQ's master catalog.</p>
        {genres.map(genre=><p key={genre.genreId}><label>
          <input type="checkbox" checked={profile.genreIds.includes(genre.genreId)}
            disabled={!profile.genreIds.includes(genre.genreId)&&profile.genreIds.length>=20}
            onChange={event=>toggle(genre.genreId,event.target.checked)}/> {genre.name}
        </label></p>)}
      </fieldset>
      <p><button className={styles.signout} type="submit" disabled={saving||!profile.name.trim()}>
        {saving?"Saving…":"Save Artist Profile"}</button></p>
      {message&&<p role="status">{message}</p>}
    </form>}
  </section>;
}
