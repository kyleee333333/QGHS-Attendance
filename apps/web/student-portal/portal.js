// API contract: configure API_BASE to the school's HTTPS API origin.
const API_BASE = window.QGHS_API_BASE || "http://localhost:4000";
let accessToken = null; // Memory-only: never persist an access token in localStorage.
const byId = (id) => document.getElementById(id);
const showMessage = (id, message) => { byId(id).textContent = message; };
async function api(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: "Bearer " + accessToken } : {}), ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || "Unable to complete the request.");
  return payload;
}
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }
async function loadPortal() {
  const me = await api("/api/portal/me");
  byId("display-name").textContent = me.student.displayName;
  byId("grade-section").textContent = [me.student.gradeLevel, me.student.sectionName].filter(Boolean).join(" — ") || "—";
  byId("student-number").textContent = me.student.maskedStudentNumber || "—";
  byId("school-year").textContent = me.student.schoolYear || "—";
  byId("login-view").hidden = true; byId("portal-view").hidden = false;
  const rows = await api("/api/portal/attendance");
  byId("attendance-rows").innerHTML = rows.events.length ? rows.events.map(event => `<tr><td>${escapeHtml(event.date)}</td><td>${escapeHtml(event.time)}</td><td>${escapeHtml(event.direction)}</td><td>${escapeHtml(event.location || "—")}</td></tr>`).join("") : '<tr><td colspan="4">No attendance records are available for this account yet.</td></tr>';

}
byId("login-form").addEventListener("submit", async event => {
  event.preventDefault(); showMessage("login-message", "Signing in…");
  try {
    const result = await api("/api/auth/login", { method:"POST", body:JSON.stringify({ username:byId("username").value, password:byId("password").value }) });
    accessToken = result.accessToken;
    await loadPortal();
  } catch (error) { accessToken = null; showMessage("login-message", error.message); }
});
byId("logout").addEventListener("click", () => { accessToken = null; byId("portal-view").hidden = true; byId("login-view").hidden = false; byId("login-form").reset(); });
byId("refresh").addEventListener("click", async () => { try { await loadPortal(); } catch (error) { showMessage("login-message", error.message); } });
