import type { FastifyInstance } from "fastify";
import { connectDb, query } from "../db.js";
import { devArtistActor, devArtistEnabled } from "./dev-artist-auth.js";

type ProfileInput = { name: string; biography: string; genreIds: string[]; primaryGenreId: string };
const idSchema = { type: "string", pattern: "^[0-9]+$", maxLength: 19 } as const;
const profileSchema = { body: { type: "object", additionalProperties: false, required: ["name","biography","genreIds","primaryGenreId"],
  properties: { name: {type:"string",minLength:1,maxLength:120}, biography: {type:"string",maxLength:5000},
    genreIds: {type:"array",uniqueItems:true,items:idSchema}, primaryGenreId:idSchema } } } as const;

export function registerDevArtistProfiles(app: FastifyInstance): void {
  if (!devArtistEnabled()) return;
  app.get("/dev/music/genres", async (req,reply) => {
    if (!await devArtistActor(req.headers)) return reply.code(401).send({message:"Not signed in."});
    const [genres,parents,aliases] = await Promise.all([
      query(`SELECT genre_id::text AS "genreId",code,name,kind FROM catalog.genre WHERE active=TRUE ORDER BY name`),
      query(`SELECT gp.genre_id::text AS "genreId",gp.parent_genre_id::text AS "parentGenreId"
        FROM catalog.genre_parent gp JOIN catalog.genre child ON child.genre_id=gp.genre_id AND child.active=TRUE
        JOIN catalog.genre parent ON parent.genre_id=gp.parent_genre_id AND parent.active=TRUE`),
      query(`SELECT genre_id::text AS "genreId",alias FROM catalog.genre_alias`)
    ]);
    return {genres:genres.rows,parents:parents.rows,aliases:aliases.rows};
  });
  app.get<{Params:{channelId:string}}>("/dev/artist/channels/:channelId/profile",async(req,reply)=>{
    const party=await devArtistActor(req.headers);
    if(!party)return reply.code(401).send({message:"Not signed in."});
    if(!/^\d+$/.test(req.params.channelId))return reply.code(400).send({message:"Invalid artist space."});
    const result=await query<{channelId:string;name:string;biography:string;genreIds:string[];primaryGenreId:string|null}>(`
      SELECT c.channel_id::text AS "channelId",c.name,COALESCE(p.biography,'') AS biography,
        COALESCE((SELECT array_agg(cg.genre_id::text ORDER BY cg.genre_id) FROM artist.channel_genre cg
          WHERE cg.channel_id=c.channel_id),'{}'::text[]) AS "genreIds",
        (SELECT cg.genre_id::text FROM artist.channel_genre cg
          WHERE cg.channel_id=c.channel_id AND cg.is_primary=TRUE) AS "primaryGenreId"
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
    if(!/^\d+$/.test(req.params.channelId))return reply.code(400).send({message:"Invalid artist space."});
    const {name,biography,genreIds,primaryGenreId}=req.body;
    if(!name.trim())return reply.code(400).send({message:"Artist name required."});
    if(!genreIds.includes(primaryGenreId))return reply.code(400).send({message:"Select a primary genre from your selections."});
    const client=await connectDb();
    try{
      await client.query("BEGIN");
      const owner=await client.query(`SELECT c.channel_id FROM artist.artist_channel c
        JOIN artist.channel_party cp ON cp.channel_id=c.channel_id AND cp.party_id=$2
          AND cp.relation_code='owner' AND cp.end_date IS NULL
        WHERE c.channel_id=$1 AND c.end_date IS NULL FOR UPDATE OF c`,[req.params.channelId,party]);
      if(!owner.rowCount){await client.query("ROLLBACK");return reply.code(404).send({message:"Artist space not found."});}
      const valid=await client.query<{count:string;primaryCount:string}>(`SELECT count(*)::text AS count,
        count(*) FILTER (WHERE genre_id=$2::bigint AND kind='genre')::text AS "primaryCount"
        FROM catalog.genre WHERE active=TRUE AND genre_id=ANY($1::bigint[])`,[genreIds,primaryGenreId]);
      if(Number(valid.rows[0].count)!==genreIds.length || Number(valid.rows[0].primaryCount)!==1){
        await client.query("ROLLBACK");return reply.code(400).send({message:"Invalid music categories or primary genre."});
      }
      await client.query(`UPDATE artist.artist_channel SET name=$2,update_date=now() WHERE channel_id=$1`,[req.params.channelId,name.trim()]);
      await client.query(`INSERT INTO artist.channel_profile(channel_id,biography) VALUES($1,$2)
        ON CONFLICT(channel_id) DO UPDATE SET biography=EXCLUDED.biography,updated_at=now()`,[req.params.channelId,biography.trim()]);
      await client.query(`DELETE FROM artist.channel_genre WHERE channel_id=$1`,[req.params.channelId]);
      await client.query(`INSERT INTO artist.channel_genre(channel_id,genre_id,is_primary)
        SELECT $1,selected.genre_id,selected.genre_id=$3::bigint
        FROM unnest($2::bigint[]) AS selected(genre_id)`,[req.params.channelId,genreIds,primaryGenreId]);
      await client.query("COMMIT");
      return {profile:{channelId:req.params.channelId,name:name.trim(),biography:biography.trim(),genreIds,primaryGenreId}};
    }catch(err){
      await client.query("ROLLBACK").catch(()=>undefined);
      req.log.error({err,requestId:req.id},"Artist profile update failed");
      return reply.code(503).send({message:"Could not save artist profile."});
    }finally{client.release();}
  });
}
