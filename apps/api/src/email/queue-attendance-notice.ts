import { openAccessConnection } from "../db/connection.js";
export async function queueAttendanceNotice(studentId:number,eventId:number,kind:"CHECKIN"|"CHECKOUT",subject:string,body:string){
 let db;
 try{
  db=await openAccessConnection();
  const guardians=await db.query("SELECT G.GuardianLinkID FROM (GuardianLinks G INNER JOIN Users U ON G.UserID=U.UserID) INNER JOIN EmailNotificationPreferences P ON G.GuardianLinkID=P.GuardianLinkID WHERE G.StudentID=? AND G.IsActive=True AND U.IsActive=True AND U.EmailVerifiedAt IS NOT NULL AND U.Email IS NOT NULL AND ((?='CHECKIN' AND P.AttendanceCheckIn=True) OR (?='CHECKOUT' AND P.AttendanceCheckOut=True))",[studentId,kind,kind]) as Array<{GuardianLinkID:number}>;
  for(const guardian of guardians){
   await db.query("INSERT INTO EmailNotificationOutbox (GuardianLinkID,AttendanceEventID,NotificationType,SubjectText,BodyText,DeliveryStatus,AttemptCount,CreatedAt) VALUES (?,?,?,?,?,?,?,?)",[guardian.GuardianLinkID,eventId,kind,subject,body,"PENDING",0,new Date()]);
  }
  return guardians.length;
 }finally{if(db)await db.close();}
}
