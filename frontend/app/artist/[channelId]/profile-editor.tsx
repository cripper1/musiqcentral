"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import styles from "../../dashboard/dashboard.module.css";

type Genre = {genreId:string;code:string;name:string;kind:"genre"|"style"};
type Parent = {genreId:string;parentGenreId:string};
type Alias = {genreId:string;alias:string};
type Profile = {channelId:string;name:string;biography:string;genreIds:string[];primaryGenreId:string|null};

export function ArtistProfileEditor({channelId,onSaved}:{channelId:string;onSaved:(name:string)=>void}){
  const [genres,setGenres]=useState<Genre[]>([]);
  const [parents,setParents]=useState<Parent[]>([]);
  const [aliases,setAliases]=useState<Alias[]>([]);
  const [profile,setProfile]=useState<Profile|null>(null);
  const [search,setSearch]=useState("");
  const [expanded,setExpanded]=useState<string[]>([]);
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
      if(!pd.profile||!Array.isArray(gd.genres)||!Array.isArray(gd.parents)||!Array.isArray(gd.aliases))
        throw new Error("Invalid artist profile response.");
      setProfile(pd.profile);setGenres(gd.genres);setParents(gd.parents);setAliases(gd.aliases);
    }).catch(err=>{if(!controller.signal.aborted)setError(err instanceof Error?err.message:"Could not load profile.");})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[channelId]);

  const byId=useMemo(()=>new Map(genres.map(g=>[g.genreId,g])),[genres]);
  const children=useMemo(()=>{
    const map=new Map<string,string[]>();
    for(const edge of parents)map.set(edge.parentGenreId,[...(map.get(edge.parentGenreId)??[]),edge.genreId]);
    return map;
  },[parents]);
  const matching=useMemo(()=>{
    const term=search.trim().toLocaleLowerCase();
    if(!term)return null;
    const found=new Set<string>();
    for(const genre of genres){
      if(genre.name.toLocaleLowerCase().includes(term)||genre.code.includes(term)||
        aliases.some(a=>a.genreId===genre.genreId&&a.alias.toLocaleLowerCase().includes(term))){
        found.add(genre.genreId);
      }
    }
    const queue=[...found];
    while(queue.length){
      const id=queue.shift()!;
      for(const edge of parents.filter(p=>p.genreId===id)){
        if(!found.has(edge.parentGenreId)){found.add(edge.parentGenreId);queue.push(edge.parentGenreId);}
      }
    }
    return found;
  },[search,genres,parents,aliases]);
  function toggle(genreId:string){
    setProfile(current=>{
      if(!current)return current;
      const selected=current.genreIds.includes(genreId);
      const genreIds=selected?current.genreIds.filter(id=>id!==genreId):[...current.genreIds,genreId];
      const primaryGenreId=selected&&current.primaryGenreId===genreId?null:current.primaryGenreId;
      return {...current,genreIds,primaryGenreId};
    });
    setMessage("");
  }
  function choosePrimary(id:string){
    setProfile(current=>current?{...current,primaryGenreId:id,genreIds:current.genreIds.includes(id)?current.genreIds:[...current.genreIds,id]}:current);
    setMessage("");
  }
  function expand(id:string){setExpanded(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);}
  function renderGenre(id:string,depth:number,trail:string[]):React.ReactNode{
    const genre=byId.get(id);
    if(!genre||trail.includes(id)||matching&&!matching.has(id))return null;
    const childIds=(children.get(id)??[]).filter(child=>byId.has(child)).sort((a,b)=>byId.get(a)!.name.localeCompare(byId.get(b)!.name));
    const isOpen=Boolean(matching)||expanded.includes(id);
    const selected=profile?.genreIds.includes(id)??false;
    return <div key={id} className={styles.genreNode}>
      <div className={styles.genreLine}>
        {childIds.length>0?<button type="button" className={styles.genreExpand} aria-expanded={isOpen}
          aria-label={`${isOpen?"Collapse":"Expand"} ${genre.name}`} onClick={()=>expand(id)}>{isOpen?"▾":"▸"}</button>:<span className={styles.genreIndent}/>}
        <button type="button" className={selected?styles.genreSelected:styles.genreChoice}
          aria-pressed={selected} disabled={saving} onClick={()=>toggle(id)}>{genre.name}{selected?" ✓":""}</button>
        {genre.kind==="genre"&&selected&&<button type="button" disabled={saving}
          className={profile?.primaryGenreId===id?styles.genrePrimaryActive:styles.genrePrimary}
          aria-pressed={profile?.primaryGenreId===id} onClick={()=>choosePrimary(id)}>
          {profile?.primaryGenreId===id?"★ Primary":"Make primary"}</button>}
      </div>
      {isOpen&&childIds.length>0&&<div className={styles.genreChildren}>
        {childIds.map(child=>renderGenre(child,depth+1,[...trail,id]))}
      </div>}
    </div>;
  }
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!profile||saving)return;
    if(!profile.primaryGenreId||!profile.genreIds.includes(profile.primaryGenreId)){
      setError("Choose one primary broad genre before saving.");return;
    }
    setSaving(true);setError("");setMessage("");
    try{
      const response=await fetch(`/api/artist/channels/${encodeURIComponent(channelId)}/profile`,{
        method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({
          name:profile.name,biography:profile.biography,genreIds:profile.genreIds,primaryGenreId:profile.primaryGenreId
        })
      });
      const result=await response.json();
      if(!response.ok||!result.profile)throw new Error(result.message??"Could not save artist profile.");
      setProfile(result.profile);onSaved(result.profile.name);setMessage("Artist profile saved.");
    }catch(err){setError(err instanceof Error?err.message:"Could not save artist profile.");}
    finally{setSaving(false);}
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
      <fieldset className={styles.genrePicker} disabled={saving}>
        <legend>Music genres and styles</legend>
        <p>Choose a primary broad genre, then add any other genres or styles that describe your music. Three to five is a useful starting point.</p>
        <label htmlFor="artist-genre-search">Find genres and styles</label>
        <input id="artist-genre-search" className={styles.genreSearch} type="search" value={search}
          placeholder="Search genres, styles, or alternative names" onChange={event=>setSearch(event.target.value)}/>
        <div className={styles.genreChips} aria-label="Selected music classifications">
          {profile.genreIds.length===0?<p>No genres selected yet.</p>:profile.genreIds.map(id=>{
            const genre=byId.get(id);
            return <span key={id} className={styles.genreChip}>
              {genre?.name??"Unavailable classification"}{profile.primaryGenreId===id?" ★ Primary":""}
              <button type="button" disabled={saving} aria-label={`Remove ${genre?.name??"classification"}`}
                onClick={()=>toggle(id)}>×</button>
            </span>;
          })}
        </div>
        <div className={styles.genreBrowser}>
          {genres.filter(g=>g.kind==="genre"&&(!matching||matching.has(g.genreId)))
            .map(g=>renderGenre(g.genreId,0,[]))}
          {matching&&![...matching].some(id=>byId.get(id)?.kind==="genre")&&<p>No matching genres or styles.</p>}
        </div>
        {!profile.primaryGenreId&&<p className={styles.error}>Select a broad genre and mark it as primary.</p>}
      </fieldset>
      <p><button className={styles.signout} type="submit" disabled={saving||!profile.name.trim()||!profile.primaryGenreId}>
        {saving?"Saving…":"Save Artist Profile"}</button></p>
      {message&&<p role="status">{message}</p>}
    </form>}
  </section>;
}
