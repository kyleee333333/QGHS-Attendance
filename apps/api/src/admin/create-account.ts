import { createInterface } from "node:readline";
import { openAccessConnection } from "../db/connection.js";
import { hashPassword } from "../auth/passwords.js";
const rl=createInterface({input:process.stdin,output:process.stdout});
const ask=(label:string)=>new Promise<string>(resolve=>rl.question(label,resolve));
async function hiddenPassword():Promise<string>{
 if(!process.stdin.isTTY||!process.stdin.setRawMode)throw new Error("Run this command in an interactive terminal.");
 process.stdout.write("Initial password (hidden): ");
 return new Promise((resolve,reject)=>{
  let value="";const input=process.stdin;input.setRawMode(true);input.resume();
  const finish=()=>{input.setRawMode(false);input.pause();input.removeListener("data",onData);process.stdout.write("\n");resolve(value);};
  const onData=(chunk:Buffer)=>{for(const char of chunk.toString("utf8")){if(char==="\u0003"){input.setRawMode(false);reject(new Error("Cancelled."));return;}if(char==="\r"||char==="\n"){finish();return;}if(char==="\u007f"||char==="\b"){value=value.slice(0,-1);continue;}if(char>=" "&&char<="~")value+=char;}};
  input.on("data",onData);
 });
}
async function main(){
 const username=(await ask("Username: ")).trim();const displayName=(await ask("Display name: ")).trim();const email=(await ask("Email (leave blank if not applicable): ")).trim();const role=(await ask("Role (student/parent/staff/admin): ")).trim().toLowerCase();
 if(!username||!displayName||!["student","parent","staff","admin"].includes(role))throw new Error("Invalid account details.");
 const password=await hiddenPassword();const passwordHash=await hashPassword(password);let db;
 try{
  db=await openAccessConnection();const now=new Date();
  await db.query("INSERT INTO Users (Username,PasswordHash,DisplayName,Email,IsActive,CreatedAt,UpdatedAt) VALUES (?,?,?,?,?,?,?)",[username,passwordHash,displayName,email||null,true,now,now]);
  const created=await db.query("SELECT UserID FROM Users WHERE Username=?",[username]) as Array<{UserID:number}>;
  if(!created[0])throw new Error("Account insert could not be confirmed.");
  await db.query("INSERT INTO UserRoles (UserID,RoleCode,AssignedAt) VALUES (?,?,?)",[created[0].UserID,role,now]);
  console.log("Account created. A school administrator must separately verify the guardian relationship or student enrollment link before portal access.");
 }finally{if(db)await db.close();rl.close();}
}
main().catch(error=>{console.error("Account provisioning failed:",error instanceof Error?error.message:"Unknown error");rl.close();process.exitCode=1;});
