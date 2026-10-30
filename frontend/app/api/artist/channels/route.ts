import { NextResponse } from "next/server";
import { cookies } from "next/headers";

async function forward(method: "GET"|"POST", endpoint: string, request?: Request) {
  const backend=process.env.MUSIQ_BACKEND_URL;
  const secret=process.env.DEV_REGISTRATION_SECRET;
  const token=(await cookies()).get("musiq_session")?.value;
  if(!backend||!secret||process.env.MUSIQ_ENV!=="development"||process.env.ENABLE_DEV_REGISTRATION!=="true")
    return NextResponse.json({message:"Artist service unavailable."},{status:503});
  if(!token)return NextResponse.json({message:"Not signed in."},{status:401});
  try{
    const body=method==="POST"?await request!.text():undefined;
    if(body&&body.length>2048)return NextResponse.json({message:"Request too large."},{status:413});
    const response=await fetch(new URL(endpoint,backend),{method,headers:{"x-dev-registration-secret":secret,"x-dev-session":token,...(body?{"content-type":"application/json"}:{})},body,cache:"no-store",signal:AbortSignal.timeout(15000)});
    const data=await response.json();
    return NextResponse.json(data,{status:response.status,headers:{"cache-control":"no-store"}});
  }catch{return NextResponse.json({message:"Artist service unavailable."},{status:503});}
}
export async function GET(){return forward("GET","/dev/artist/channels");}
export async function POST(request:Request){return forward("POST","/dev/artist/channels",request);}
