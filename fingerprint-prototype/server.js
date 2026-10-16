require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "attendance.json");

app.use(cors());
app.use(express.json({ limit: "50kb" }));
app.use(express.static(__dirname));

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ students: [], attendance: [] }, null, 2));
}
function readStore() {
  ensureStore();
  try {
    const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return { students: Array.isArray(d.students) ? d.students : [], attendance: Array.isArray(d.attendance) ? d.attendance : [] };
  } catch {
    return { students: [], attendance: [] };
  }
}
function writeStore(d) {
  ensureStore();
  const temp = DATA_FILE + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(d, null, 2));
  fs.renameSync(temp, DATA_FILE);
}
const clean = (v, max = 150) => String(v ?? "").trim().slice(0, max);
const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

app.get("/api/health", (_req, res) => res.json({ ok: true, system: "QGHS CONNECT", fingerprintMode: "simulation", realSensorConnected: false }));
app.get("/api/students", (_req, res) => {
  const d = readStore();
  res.json(d.students.map(({ demoTemplateId, ...s }) => ({ ...s, fingerprintEnrolled: Boolean(demoTemplateId) })));
});
app.post("/api/students", (req, res) => {
  const studentId = clean(req.body.studentId, 40);
  const name = clean(req.body.name, 120);
  const gradeSection = clean(req.body.gradeSection, 80);
  if (!studentId || !name || !gradeSection) return res.status(400).json({ error: "Student ID, name, and grade/section are required." });
  const d = readStore();
  if (d.students.some(s => s.studentId.toLowerCase() === studentId.toLowerCase())) return res.status(409).json({ error: "Student ID already exists." });
  const s = { id: "stu_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7), studentId, name, gradeSection, email: clean(req.body.email, 160), createdAt: new Date().toISOString(), demoTemplateId: null };
  d.students.push(s); writeStore(d);
  const { demoTemplateId, ...safe } = s;
  res.status(201).json({ ...safe, fingerprintEnrolled: false });
});
app.post("/api/students/:id/enroll-demo", (req, res) => {
  const d = readStore();
  const s = d.students.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Student not found." });
  s.demoTemplateId = "DEMO-" + s.studentId + "-" + Date.now().toString(36).toUpperCase();
  s.enrolledAt = new Date().toISOString();
  writeStore(d);
  res.json({ ok: true, fingerprintEnrolled: true, mode: "simulation", message: "Demo enrollment only; no fingerprint was captured." });
});
app.post("/api/attendance", (req, res) => {
  const studentId = clean(req.body.studentId, 40);
  const direction = clean(req.body.direction, 12).toUpperCase();
  if (!["ENTRANCE", "EXIT"].includes(direction)) return res.status(400).json({ error: "Direction must be ENTRANCE or EXIT." });
  const d = readStore();
  const s = d.students.find(x => x.studentId.toLowerCase() === studentId.toLowerCase());
  if (!s) return res.status(404).json({ error: "Student not found." });
  if (!s.demoTemplateId) return res.status(400).json({ error: "Enroll the demo fingerprint first." });
  if (d.attendance.some(a => a.studentId === s.studentId && a.date === today() && a.direction === direction)) return res.status(409).json({ error: "This direction is already recorded today." });
  const now = new Date();
  const record = { id: "att_" + Date.now(), studentId: s.studentId, name: s.name, gradeSection: s.gradeSection, direction, date: today(), time: now.toLocaleTimeString(), timestamp: now.toISOString(), method: "SIMULATED FINGERPRINT" };
  d.attendance.unshift(record); writeStore(d); res.status(201).json(record);
});
app.get("/api/attendance", (req, res) => {
  const d = readStore();
  let rows = d.attendance;
  const date = clean(req.query.date, 10);
  const id = clean(req.query.studentId, 40).toLowerCase();
  const direction = clean(req.query.direction, 12).toUpperCase();
  if (date) rows = rows.filter(a => a.date === date);
  if (id) rows = rows.filter(a => a.studentId.toLowerCase().includes(id));
  if (["ENTRANCE", "EXIT"].includes(direction)) rows = rows.filter(a => a.direction === direction);
  res.json(rows);
});
app.get("/api/export.csv", (_req, res) => {
  const rows = readStore().attendance;
  const cols = ["date", "time", "studentId", "name", "gradeSection", "direction", "method"];
  const quote = v => '"' + String(v ?? "").replace(/"/g, '""') + '"';
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="qghs-attendance.csv"');
  res.send([cols.join(","), ...rows.map(r => cols.map(c => quote(r[c])).join(","))].join("\r\n"));
});
app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "index.html")));
ensureStore();
app.listen(PORT, () => console.log("QGHS CONNECT server listening on port " + PORT + " (simulation mode only)"));
