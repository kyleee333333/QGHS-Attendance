import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import { openAccessConnection } from "../db/connection.js";
const router=Router();
router.get("/me",requireAuth(["parent"]),async(_req,res)=>{
 let db;try{
  const auth=res.locals.auth as {userId:number};db=await openAccessConnection();
  const guardian=await db.query("SELECT DisplayName,Email FROM Users WHERE UserID=? AND IsActive=True AND EmailVerifiedAt IS NOT NULL",[auth.userId]) as Array<{DisplayName:string;Email:string}>;
  const linked=await db.query("SELECT TOP 1 S.GivenName,S.MiddleName,S.FamilyName,S.GradeLevel,S.SectionName FROM GuardianLinks G INNER JOIN Students S ON G.StudentID=S.StudentID WHERE G.UserID=? AND G.IsActive=True AND S.IsActive=True",[auth.userId]) as Array<Record<string,unknown>>;
  if(!guardian[0]||!linked[0]){res.status(404).json({error:{code:"VERIFIED_LINK_REQUIRED",message:"A verified parent account and active child link are required."}});return;}
  res.json({guardian:{displayName:guardian[0].DisplayName},student:{displayName:[linked[0].GivenName,linked[0].MiddleName,linked[0].FamilyName].filter(Boolean).join(" "),gradeLevel:linked[0].GradeLevel,sectionName:linked[0].SectionName}});
 }catch{res.status(503).json({error:{code:"PARENT_PORTAL_UNAVAILABLE",message:"Parent information is temporarily unavailable."}});}finally{if(db)await db.close();}
});
export default router;
