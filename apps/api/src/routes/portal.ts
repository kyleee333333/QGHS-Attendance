import { Router } from "express";
import { requireAuth } from "../auth/middleware.js";
import { openAccessConnection } from "../db/connection.js";
const router=Router();
router.get("/me",requireAuth(["student"]),async(_req,res)=>{
 let db;try{
  const auth=res.locals.auth as {userId:number};db=await openAccessConnection();
  const rows=await db.query("SELECT S.GivenName,S.MiddleName,S.FamilyName,S.GradeLevel,S.SectionName,S.SchoolYear,S.StudentNumber FROM StudentAccountLinks L INNER JOIN Students S ON L.StudentID=S.StudentID WHERE L.UserID=? AND L.IsActive=True AND S.IsActive=True",[auth.userId]) as Array<Record<string,unknown>>;
  const s=rows[0];if(!s){res.status(404).json({error:{code:"STUDENT_LINK_REQUIRED",message:"No active student profile is linked to this account."}});return;}
  const n=String(s.StudentNumber||"");res.json({student:{displayName:[s.GivenName,s.MiddleName,s.FamilyName].filter(Boolean).join(" "),gradeLevel:s.GradeLevel,sectionName:s.SectionName,schoolYear:s.SchoolYear,maskedStudentNumber:n.length>4?"••••"+n.slice(-4):"••••"}});
 }catch{res.status(503).json({error:{code:"PORTAL_UNAVAILABLE",message:"Student profile is temporarily unavailable."}});}finally{if(db)await db.close();}
});
router.get("/attendance",requireAuth(["student"]),async(_req,res)=>{
 let db;try{
  const auth=res.locals.auth as {userId:number};db=await openAccessConnection();
  const rows=await db.query("SELECT TOP 100 A.EventAt,A.EventDirection,T.LocationName FROM (AttendanceEvents A INNER JOIN StudentAccountLinks L ON A.StudentID=L.StudentID) LEFT JOIN Terminals T ON A.TerminalID=T.TerminalID WHERE L.UserID=? AND L.IsActive=True ORDER BY A.EventAt DESC",[auth.userId]) as Array<{EventAt:Date|string;EventDirection:string;LocationName?:string}>;
  res.json({events:rows.map(e=>({date:new Date(e.EventAt).toISOString().slice(0,10),time:new Date(e.EventAt).toISOString().slice(11,16),direction:e.EventDirection,location:e.LocationName||null}))});
 }catch{res.status(503).json({error:{code:"ATTENDANCE_UNAVAILABLE",message:"Attendance history is temporarily unavailable."}});}finally{if(db)await db.close();}
});
export default router;
