import { openAccessConnection } from "../db/connection.js";
import { sendNotification } from "./mailer.js";
export async function processEmailOutboxBatch(limit=20){
 let db;let sent=0;
 try{
  db=await openAccessConnection();
  const pending=await db.query("SELECT TOP 20 O.EmailOutboxID,O.SubjectText,O.BodyText,U.Email FROM (EmailNotificationOutbox O INNER JOIN GuardianLinks G ON O.GuardianLinkID=G.GuardianLinkID) INNER JOIN Users U ON G.UserID=U.UserID WHERE O.DeliveryStatus='PENDING' AND G.IsActive=True AND U.IsActive=True AND U.EmailVerifiedAt IS NOT NULL AND U.Email IS NOT NULL ORDER BY O.CreatedAt") as Array<{EmailOutboxID:number;SubjectText:string;BodyText:string;Email:string}>;
  for(const item of pending.slice(0,limit)){
   try{
    await sendNotification(item.Email,item.SubjectText,item.BodyText);
    await db.query("UPDATE EmailNotificationOutbox SET DeliveryStatus='SENT',SentAt=?,AttemptCount=AttemptCount+1 WHERE EmailOutboxID=? AND DeliveryStatus='PENDING'",[new Date(),item.EmailOutboxID]);sent++;
   }catch(error){
    const code=error instanceof Error?error.name.slice(0,60):"DELIVERY_ERROR";
    await db.query("UPDATE EmailNotificationOutbox SET AttemptCount=AttemptCount+1,LastErrorCode=?,DeliveryStatus=IIF(AttemptCount+1>=5,'FAILED','PENDING') WHERE EmailOutboxID=?",[code,item.EmailOutboxID]);
   }
  }
  return {checked:pending.length,sent};
 }finally{if(db)await db.close();}
}
