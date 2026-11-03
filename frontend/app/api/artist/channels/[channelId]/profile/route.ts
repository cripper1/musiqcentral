import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function forward(method:"GET"|"PUT",request:Request,channelId:string) {
  const backend=process.env.MUSIQ_BACKEND_URL;
  const secret=process.env.DEV_REGISTRATION_SECRET;
  const token=(await cookies()).get("musiq_session")?.value;
  if(!backend||!secret||process.env.MUSIQ_ENV!=="development"||process.env.ENABLE_DEV_REGISTRATION!=="true")
    return NextResponse.json({message:"Artist service unavailable."},{status:503});
  if(!token)return NextResponse.json({message:"Not signed in."},{status:401});
  if(!/^\d+$/.test(channelId))return NextResponse.json({message:"Invalid artist space."},{status:400});
  try {
    const body=method==="PUT"?await request.text():undefined;
    if(body&&body.length>16000)return NextResponse.json({message:"Request too large."},{status:413});
    const response=await fetch(new URL(`/dev/artist/channels/${channelId}/profile`,backend),{
      method,headers:{"x-dev-registration-secret":secret,"x-dev-session":token,...(body?{"content-type":"application/json"}:{})},
      body,cache:"no-store",signal:AbortSignal.timeout(15000)
    });
    return NextResponse.json(await response.json(),{status:response.status,headers:{"cache-control":"no-store"}});
  }catch{return NextResponse.json({message:"Artist service unavailable."},{status:503});}
}
type Context={params:Promise<{channelId:string}>};
export async function GET(request:Request,{params}:Context){return forward("GET",request,(await params).channelId);}
export async function PUT(request:Request,{params}:Context){return forward("PUT",request,(await params).channelId);}
