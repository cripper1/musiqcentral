import type { FastifyInstance } from "fastify";
import { connectDb, query } from "../db.js";
import { devArtistActor, devArtistEnabled } from "./dev-artist-auth.js";

export function registerDevArtist(app: FastifyInstance): void {
  if (!devArtistEnabled()) return;
  const actor = devArtistActor;
  app.get("/dev/artist/channels",async(req,reply)=>{
    const party=await actor(req.headers); if(!party)return reply.code(401).send({message:"Not signed in."});
    const result=await query(`SELECT c.channel_id::text AS "channelId",c.name FROM artist.artist_channel c JOIN artist.channel_party cp ON cp.channel_id=c.channel_id WHERE cp.party_id=$1 AND cp.relation_code='owner' AND cp.end_date IS NULL AND c.end_date IS NULL ORDER BY c.channel_id`,[party]);
    return {channels:result.rows};
  });
  app.post("/dev/artist/channels",{schema:{body:{type:"object",additionalProperties:false,required:["name"],properties:{name:{type:"string",minLength:1,maxLength:120}}}}},async(req,reply)=>{
    const party=await actor(req.headers);if(!party)return reply.code(401).send({message:"Not signed in."});
    const name=(req.body as {name:string}).name.trim();if(!name)return reply.code(400).send({message:"Channel name required."});
    const db=await connectDb();
    try {
      await db.query("BEGIN");
      const channel=await db.query<{channel_id:string}>(`INSERT INTO artist.artist_channel(name) VALUES($1) RETURNING channel_id::text`,[name]);
      await db.query(`INSERT INTO artist.channel_party(channel_id,party_id,relation_code) VALUES($1,$2,'owner')`,[channel.rows[0].channel_id,party]);
      await db.query("COMMIT");
      return reply.code(201).send({channel:{channelId:channel.rows[0].channel_id,name}});
    }catch(err){await db.query("ROLLBACK").catch(()=>undefined);req.log.error({err},"Channel creation failed");return reply.code(503).send({message:"Could not save artist channel."});}finally{db.release();}
  });
  app.get("/dev/artist/recordings",async(req,reply)=>{
    const party=await actor(req.headers);if(!party)return reply.code(401).send({message:"Not signed in."});
    const result=await query(`SELECT cr.channel_id::text AS "channelId",r.recording_id::text AS "recordingId",r.title,a.state AS "uploadState",a.original_filename AS "filename" FROM catalog.channel_recording cr JOIN artist.channel_party cp ON cp.channel_id=cr.channel_id AND cp.party_id=$1 AND cp.relation_code='owner' AND cp.end_date IS NULL JOIN catalog.recording r ON r.recording_id=cr.recording_id AND r.end_date IS NULL LEFT JOIN media.audio_asset a ON a.recording_id=r.recording_id ORDER BY r.recording_id DESC`,[party]);
    return {recordings:result.rows};
  });
}
