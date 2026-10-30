import type { FastifyInstance } from "fastify";
import { createHash, timingSafeEqual } from "node:crypto";
import { getIdentityDb } from "../identity-db.js";
import { connectDb, query } from "../db.js";

const enabled = () => process.env.MUSIQ_ENV === "development" && process.env.ENABLE_DEV_REGISTRATION === "true";
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export function registerDevArtist(app: FastifyInstance): void {
  if (!enabled()) return;
  const secret = process.env.DEV_REGISTRATION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error("DEV_REGISTRATION_SECRET required");
  async function actor(headers: Record<string, unknown>): Promise<string | null> {
    const key = headers["x-dev-registration-secret"];
    const token = headers["x-dev-session"];
    if (typeof key !== "string" || typeof token !== "string" || token.length > 128) return null;
    const a = Buffer.from(createHash("sha256").update(key).digest());
    const b = Buffer.from(createHash("sha256").update(secret!).digest());
    if (!timingSafeEqual(a,b)) return null;
    const db = await getIdentityDb();
    const session = await db.collection<{party_id:string;account_id:string;expires_at:Date}>("dev_sessions").findOne({token_hash:tokenHash(token),expires_at:{$gt:new Date()}});
    if (!session) return null;
    const result = await query<{party_id:string}>(`SELECT a.party_id::text FROM iam.account a JOIN iam.account_status s ON s.status_id=a.status_id JOIN iam.account_provisioning p ON p.account_id=a.account_id WHERE a.account_id=$1 AND a.party_id=$2 AND a.end_date IS NULL AND s.code='active' AND p.state='complete'`,[session.account_id,session.party_id]);
    return result.rows[0]?.party_id ?? null;
  }
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
