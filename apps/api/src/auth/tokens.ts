import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
export type PortalRole = "student" | "parent" | "staff" | "admin";
export interface AuthClaims { sub:number; role:PortalRole; exp:number }
function secret():string { const value=env.JWT_ACCESS_SECRET; if(!value||value.length<32||value.startsWith("replace-with")) throw new Error("Set a unique JWT_ACCESS_SECRET of at least 32 characters."); return value; }
const encode=(value:unknown)=>Buffer.from(JSON.stringify(value)).toString("base64url");
function sign(data:string):string{return createHmac("sha256",secret()).update(data).digest("base64url");}
export function issueAccessToken(userId:number,role:PortalRole):string { const ttl=env.JWT_ACCESS_TTL_SECONDS; const head=encode({alg:"HS256",typ:"JWT"}); const body=encode({sub:userId,role,exp:Math.floor(Date.now()/1000)+ttl}); const input=head+"."+body; return input+"."+sign(input); }
export function verifyAccessToken(token:string):AuthClaims|null { try { const parts=token.split("."); if(parts.length!==3)return null; const input=parts[0]+"."+parts[1]; const expected=Buffer.from(sign(input)); const actual=Buffer.from(parts[2]); if(expected.length!==actual.length||!timingSafeEqual(expected,actual))return null; const payload=JSON.parse(Buffer.from(parts[1],"base64url").toString("utf8")) as AuthClaims; if(!Number.isInteger(payload.sub)||payload.sub<1||payload.exp<=Math.floor(Date.now()/1000))return null; if(!["student","parent","staff","admin"].includes(payload.role))return null; return payload; }catch{return null;} }
