const API_BASE = window.QGHS_API_BASE || "http://localhost:4000";
let accessToken = null;
const el = id => document.getElementById(id);
const say = (id, text) => { el(id).textContent = text; };
async function api(path, options={}) {
  const response = await fetch(API_BASE + path, { ...options, headers:{"Content-Type":"application/json",...(accessToken?{Authorization:"Bearer "+accessToken}:{}),...(options.headers||{})} });
  const data = await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data?.error?.message || "Unable to complete request.");
  return data;
}
const esc = value => String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function load() {
  const me = await api("/api/parent/me");
  el("display-name").textContent = me.guardian.displayName;
  el("student-name").textContent = me.student.displayName;
  el("student-meta").textContent = [me.student.gradeLevel,me.student.sectionName].filter(Boolean).join(" • ");
  const history = await api("/api/parent/attendance");
  el("attendance-rows").innerHTML = history.events.length ? history.events.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.time)}</td><td>${esc(e.direction)}</td><td>${esc(e.location||"—")}</td></tr>`).join("") : '<tr><td colspan="4">No attendance records available.</td></tr>';
  const prefs = await api("/api/parent/notification-preferences");
  el("checkin-pref").checked=!!prefs.attendanceCheckIn;el("checkout-pref").checked=!!prefs.attendanceCheckOut;el("absence-pref").checked=!!prefs.absenceAlert;
  el("login-view").hidden=true;el("portal-view").hidden=false;
}
el("login-form").addEventListener("submit",async e=>{e.preventDefault();say("login-message","Signing in…");try{const r=await api("/api/auth/login",{method:"POST",body:JSON.stringify({username:el("username").value,password:el("password").value})});accessToken=r.accessToken;await load();}catch(err){accessToken=null;say("login-message",err.message);}});
el("logout").addEventListener("click",()=>{accessToken=null;el("portal-view").hidden=true;el("login-view").hidden=false;el("login-form").reset();});
el("save-preferences").addEventListener("click",async()=>{try{await api("/api/parent/notification-preferences",{method:"PUT",body:JSON.stringify({attendanceCheckIn:el("checkin-pref").checked,attendanceCheckOut:el("checkout-pref").checked,absenceAlert:el("absence-pref").checked})});say("preferences-message","Preferences saved.");}catch(err){say("preferences-message",err.message);}});
