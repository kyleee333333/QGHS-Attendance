import "dotenv/config";
import { processEmailOutboxBatch } from "./worker.js";
const interval=Number(process.env.EMAIL_WORKER_INTERVAL_MS||30000);
if(!Number.isFinite(interval)||interval<10000)throw new Error("EMAIL_WORKER_INTERVAL_MS must be at least 10000.");
let running=false;
async function tick(){if(running)return;running=true;try{const result=await processEmailOutboxBatch();if(result.checked)console.log("Email outbox processed",result);}catch(error){console.error("Email worker error",error);}finally{running=false;}}
console.log("QGHS CONNECT email worker started.");
void tick();
setInterval(()=>void tick(),interval);
