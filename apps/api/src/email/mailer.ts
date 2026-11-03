import nodemailer from "nodemailer";
import { env } from "../config/env.js";
let transport:nodemailer.Transporter|undefined;
export function getMailer(){
 if(!env.SMTP_HOST||!env.SMTP_USER||!env.SMTP_PASSWORD)throw new Error("SMTP is not configured.");
 if(!transport)transport=nodemailer.createTransport({host:env.SMTP_HOST,port:env.SMTP_PORT,secure:env.SMTP_PORT===465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD}});
 return transport;
}
export async function sendNotification(to:string,subject:string,text:string){
 await getMailer().sendMail({from:env.SMTP_FROM,to,subject,text});
}
