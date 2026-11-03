import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/middleware.js";
import { openAccessConnection } from "../db/connection.js";
const router=Router();
const schema=z.object({attendanceCheckIn:z.boolean(),attendanceCheckOut:z.boolean(),absenceAlert:z.boolean()});
router.get("/notification-preferences",requireAuth(["parent"]),async(_req,res)=>{
 let db;try{
  const auth=res.locals.auth as {userId:number};db=await openAccessConnection();
  const rows=await db.query("SELECT TOP 1 P.AttendanceCheckIn,P.AttendanceCheckOut,P.AbsenceAlert FROM (EmailNotificationPreferences P INNER JOIN GuardianLinks G ON P.GuardianLinkID=G.GuardianLinkID) INNER JOIN Users U ON G.UserID=U.UserID WHERE G.UserID=? AND G.IsActive=True AND U.IsActive=True AND U.EmailVerifiedAt IS NOT NULL",[auth.userId]) as Array<{AttendanceCheckIn:boolean;AttendanceCheckOut:boolean;AbsenceAlert:boolean}>;
  res.json({attendanceCheckIn:rows[0]?.AttendanceCheckIn??false,attendanceCheckOut:rows[0]?.AttendanceCheckOut??false,absenceAlert:rows[0]?.AbsenceAlert??false});
 }catch{res.status(503).json({error:{code:"PREFERENCES_UNAVAILABLE",message:"Preferences are temporarily unavailable."}});}finally{if(db)await db.close();}
});
router.put("/notification-preferences",requireAuth(["parent"]),async(req,res)=>{
 const parsed=schema.safeParse(req.body);if(!parsed.success){res.status(400).json({error:{code:"INVALID_INPUT",message:"Invalid notification preferences."}});return;}
 let db;try{
  const auth=res.locals.auth as {userId:number};db=await openAccessConnection();
  const links=await db.query("SELECT TOP 1 G.GuardianLinkID FROM GuardianLinks G INNER JOIN Users U ON G.UserID=U.UserID WHERE G.UserID=? AND G.IsActive=True AND U.IsActive=True AND U.EmailVerifiedAt IS NOT NULL",[auth.userId]) as Array<{GuardianLinkID:number}>;
  if(!links[0]){res.status(403).json({error:{code:"NO_GUARDIAN_LINK",message:"No verified guardian link is available."}});return;}
  const id=links[0].GuardianLinkID,p=parsed.data;
  const existing=await db.query("SELECT EmailPreferenceID FROM EmailNotificationPreferences WHERE GuardianLinkID=?",[id]) as Array<{EmailPreferenceID:number}>;
  if(existing[0])await db.query("UPDATE EmailNotificationPreferences SET AttendanceCheckIn=?,AttendanceCheckOut=?,AbsenceAlert=?,UpdatedAt=? WHERE GuardianLinkID=?",[p.attendanceCheckIn,p.attendanceCheckOut,p.absenceAlert,new Date(),id]);
  else await db.query("INSERT INTO EmailNotificationPreferences (GuardianLinkID,AttendanceCheckIn,AttendanceCheckOut,AbsenceAlert,UpdatedAt) VALUES (?,?,?,?,?)",[id,p.attendanceCheckIn,p.attendanceCheckOut,p.absenceAlert,new Date()]);
  res.json({ok:true});
 }catch{res.status(503).json({error:{code:"PREFERENCE_UPDATE_FAILED",message:"Unable to save preferences."}});}finally{if(db)await db.close();}
});

router.get("/attendance",requireAuth(["parent"]),async(_req,res)=>{
 let db;try{
  const auth=res.locals.auth as {userId:number};db=await openAccessConnection();
  const rows=await db.query("SELECT TOP 100 A.EventAt,A.EventDirection,T.LocationName FROM ((AttendanceEvents A INNER JOIN GuardianLinks G ON A.StudentID=G.StudentID) LEFT JOIN Terminals T ON A.TerminalID=T.TerminalID) INNER JOIN Users U ON G.UserID=U.UserID WHERE G.UserID=? AND G.IsActive=True AND U.IsActive=True AND U.EmailVerifiedAt IS NOT NULL ORDER BY A.EventAt DESC",[auth.userId]) as Array<{EventAt:Date|string;EventDirection:string;LocationName?:string}>;
  res.json({events:rows.map(e=>({date:new Date(e.EventAt).toISOString().slice(0,10),time:new Date(e.EventAt).toISOString().slice(11,16),direction:e.EventDirection,location:e.LocationName||null}))});
 }catch{res.status(503).json({error:{code:"PARENT_ATTENDANCE_UNAVAILABLE",message:"Attendance history is temporarily unavailable."}});}finally{if(db)await db.close();}
});
export default router;
