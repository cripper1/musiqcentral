import type { FastifyInstance } from "fastify";
import { connectDb, query } from "../db.js";
import { devArtistActor, devArtistEnabled } from "./dev-artist-auth.js";

type ProfileInput = { name: string; biography: string; genreIds: number[] };
const profileSchema = { body: { type:"object", additionalProperties:false, required:["name","biography","genreIds"],
  properties: { name:{type:"string",minLength:1,maxLength:120}, biography:{type:"string",maxLength:5000},
    genreIds:{type:"array",maxItems:20,uniqueItems:true,items:{type:"integer",minimum:1}} } } } as const;

export function registerDevArtistProfiles(app: FastifyInstance): void {
  if (!devArtistEnabled()) return;
  app.get("/dev/music/genres", async (req,reply) => {
    if (!await devArtistActor(req.headers)) return reply.code(401).send({message:"Not signed in."});
    const result = await query(`SELECT genre_id AS "genreId", code, name, kind FROM catalog.genre
      WHERE active=TRUE ORDER BY name`);
    return { genres: result.rows };
  });
  app.get<{Params:{channelId:string}}>("/dev/artist/channels/:channelId/profile",async(req,reply)=>{
    const party=await devArtistActor(req.headers);
    if(!party)return reply.code(401).send({message:"Not signed in."});
    if(!/^\\d+$/.test(req.params.channelId))return reply.code(400).send({message:"Invalid artist space."});
    const result=await query<{channelId:string;name:string;biography:string;genreIds:number[]}>(`
      SELECT c.channel_id::text AS "channelId",c.name,COALESCE(p.biography,'') AS biography,
        COALESCE((SELECT array_agg(cg.genre_id ORDER BY cg.genre_id) FROM artist.channel_genre cg
          WHERE cg.channel_id=c.channel_id),'{}'::bigint[]) AS "genreIds"
      FROM artist.artist_channel c
      JOIN artist.channel_party cp ON cp.channel_id=c.channel_id AND cp.party_id=$2
        AND cp.relation_code='owner' AND cp.end_date IS NULL
      LEFT JOIN artist.channel_profile p ON p.channel_id=c.channel_id
      WHERE c.channel_id=$1 AND c.end_date IS NULL`,[req.params.channelId,party]);
    if(!result.rows[0])return reply.code(404).send({message:"Artist space not found."});
    return {profile:result.rows[0]};
  });
  app.put<{Params:{channelId:string};Body:ProfileInput}>("/dev/artist/channels/:channelId/profile",{schema:profileSchema},async(req,reply)=>{
    const party=await devArtistActor(req.headers);
    if(!party)return reply.code(401).send({message:"Not signed in."});
    if(!/^\\d+$/.test(req.params.channelId))return reply.code(400).send({message:"Invalid artist space."});
    const {name,biography,genreIds}=req.body;
    if(!name.trim())return reply.code(400).send({message:"Artist name required."});
    const client=await connectDb();
    try{
      await client.query("BEGIN");
      const owner=await client.query(`SELECT c.channel_id FROM artist.artist_channel c
        JOIN artist.channel_party cp ON cp.channel_id=c.channel_id AND cp.party_id=$2
          AND cp.relation_code='owner' AND cp.end_date IS NULL
        WHERE c.channel_id=$1 AND c.end_date IS NULL FOR UPDATE OF c`,[req.params.channelId,party]);
      if(!owner.rowCount){await client.query("ROLLBACK");return reply.code(404).send({message:"Artist space not found."});}
      const valid=await client.query<{count:string}>(`SELECT count(*)::text AS count FROM catalog.genre WHERE active=TRUE AND genre_id=ANY($1::bigint[])`,[genreIds]);
      if(Number(valid.rows[0].count)!==genreIds.length){await client.query("ROLLBACK");return reply.code(400).send({message:"Invalid music category."});}
      await client.query(`UPDATE artist.artist_channel SET name=$2,update_date=now() WHERE channel_id=$1`,[req.params.channelId,name.trim()]);
      await client.query(`INSERT INTO artist.channel_profile(channel_id,biography) VALUES($1,$2)
        ON CONFLICT(channel_id) DO UPDATE SET biography=EXCLUDED.biography,updated_at=now()`,[req.params.channelId,biography.trim()]);
      await client.query(`DELETE FROM artist.channel_genre WHERE channel_id=$1`,[req.params.channelId]);
      if(genreIds.length)await client.query(`INSERT INTO artist.channel_genre(channel_id,genre_id)
        SELECT $1,unnest($2::bigint[])`,[req.params.channelId,genreIds]);
      await client.query("COMMIT");
      return {profile:{channelId:req.params.channelId,name:name.trim(),biography:biography.trim(),genreIds}};
    }catch(err){
      await client.query("ROLLBACK").catch(()=>undefined);
      req.log.error({err,requestId:req.id},"Artist profile update failed");
      return reply.code(503).send({message:"Could not save artist profile."});
    }finally{client.release();}
  });
}
