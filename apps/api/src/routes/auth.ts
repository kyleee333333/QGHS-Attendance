import { Router } from "express";
import { z } from "zod";
import { openAccessConnection } from "../db/connection.js";
import { verifyPassword } from "../auth/passwords.js";
import { issueAccessToken,type PortalRole } from "../auth/tokens.js";
const router=Router();
const attempts=new Map<string,{count:number;until:number}>();
const schema=z.object({username:z.string().trim().min(1).max(80),password:z.string().min(1).max(200)});
router.post("/login",async(req,res)=>{
 const parsed=schema.safeParse(req.body);
 if(!parsed.success){res.status(400).json({error:{code:"INVALID_INPUT",message:"Enter your username and password."}});return;}
 const key=(req.ip||"unknown")+"|"+parsed.data.username.toLowerCase(),now=Date.now(),state=attempts.get(key);
 if(state&&state.until>now&&state.count>=8){res.status(429).json({error:{code:"TOO_MANY_ATTEMPTS",message:"Too many sign-in attempts. Try again later."}});return;}
 let db;
 try{
  db=await openAccessConnection();
  const users=await db.query("SELECT UserID,PasswordHash,IsActive FROM Users WHERE Username = ?",[parsed.data.username]) as Array<{UserID:number;PasswordHash:string;IsActive:boolean}>;
  const user=users[0];
  if(!user||!user.IsActive||!(await verifyPassword(parsed.data.password,user.PasswordHash))){
   attempts.set(key,{count:(state?.count||0)+1,until:now+15*60*1000});
   res.status(401).json({error:{code:"INVALID_CREDENTIALS",message:"Username or password is incorrect."}});return;
  }
  const roles=await db.query("SELECT RoleCode FROM UserRoles WHERE UserID = ?",[user.UserID]) as Array<{RoleCode:string}>;
  const allowed=roles.map(r=>r.RoleCode.toLowerCase()).filter(r=>["student","parent","staff","admin"].includes(r));
  if(allowed.length!==1){res.status(401).json({error:{code:"INVALID_CREDENTIALS",message:"Username or password is incorrect."}});return;}
  attempts.delete(key);
  res.json({accessToken:issueAccessToken(user.UserID,allowed[0] as PortalRole),tokenType:"Bearer",expiresIn:900});
 }catch(error){console.error("Sign-in database error",error);res.status(503).json({error:{code:"AUTH_UNAVAILABLE",message:"Sign-in is temporarily unavailable."}});}
 finally{if(db)await db.close();}
});
export default router;
