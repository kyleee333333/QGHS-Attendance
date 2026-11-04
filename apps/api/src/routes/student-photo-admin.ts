import { Router } from "express";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "../auth/middleware.js";
import { openAccessConnection } from "../db/connection.js";

const router = Router();
const staffOnly = requireAuth(["staff", "admin"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function detectImage(buffer: Buffer): { extension: string; mime: string } | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { extension: "jpg", mime: "image/jpeg" };
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return { extension: "png", mime: "image/png" };
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return { extension: "webp", mime: "image/webp" };
  return null;
}

router.get("/students/search", staffOnly, async (req, res) => {
  const term = String(req.query.term || "").trim();
  if (term.length < 3 || term.length > 80) {
    res.status(400).json({ error: { code: "INVALID_SEARCH", message: "Enter at least 3 characters of the LRN, student number, or name." } });
    return;
  }
  let db;
  try {
    db = await openAccessConnection();
    const like = "%" + term.replace(/[\[\]%_*]/g, " ") + "%";
    const rows = await db.query(
      "SELECT TOP 10 StudentID,StudentNumber,LRN,GivenName,MiddleName,FamilyName,GradeLevel,SectionName,PhotoFileName FROM Students WHERE IsActive=True AND (LRN LIKE ? OR StudentNumber LIKE ? OR GivenName LIKE ? OR FamilyName LIKE ?) ORDER BY FamilyName,GivenName",
      [like, like, like, like]
    ) as Array<Record<string, unknown>>;
    res.json({ students: rows.map(s => ({
      studentId: Number(s.StudentID), studentNumber: String(s.StudentNumber || ""),
      lrn: s.LRN ? String(s.LRN) : "", name: [s.GivenName,s.MiddleName,s.FamilyName].filter(Boolean).join(" "),
      gradeSection: [s.GradeLevel,s.SectionName].filter(Boolean).join(" — "), hasPhoto: Boolean(s.PhotoFileName)
    })) });
  } catch {
    res.status(503).json({ error: { code: "STUDENT_SEARCH_UNAVAILABLE", message: "Student search is temporarily unavailable." } });
  } finally { if (db) await db.close(); }
});

router.put("/students/:studentId/id-picture", staffOnly, async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!Number.isSafeInteger(studentId) || studentId < 1) {
    res.status(400).json({ error: { code: "INVALID_STUDENT", message: "Invalid student record." } });
    return;
  }
  const image = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!image.length || image.length > MAX_IMAGE_BYTES) {
    res.status(400).json({ error: { code: "INVALID_IMAGE_SIZE", message: "Upload one JPG, PNG, or WEBP image up to 5 MB." } });
    return;
  }
  const detected = detectImage(image);
  if (!detected) {
    res.status(415).json({ error: { code: "INVALID_IMAGE_TYPE", message: "The uploaded file is not a valid JPG, PNG, or WEBP image." } });
    return;
  }
  const photoDir = process.env.STUDENT_PHOTO_DIR;
  if (!photoDir) {
    res.status(503).json({ error: { code: "PHOTO_STORAGE_NOT_CONFIGURED", message: "Student photo storage is not configured on the server." } });
    return;
  }
  let db;
  let filename = "";
  try {
    db = await openAccessConnection();
    const existing = await db.query("SELECT StudentID FROM Students WHERE StudentID=? AND IsActive=True", [studentId]) as Array<{StudentID:number}>;
    if (!existing.length) {
      res.status(404).json({ error: { code: "STUDENT_NOT_FOUND", message: "Active student record not found." } });
      return;
    }
    filename = randomUUID() + "." + detected.extension;
    const root = path.resolve(photoDir);
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, filename), image, { flag: "wx", mode: 0o600 });
    await db.query("UPDATE Students SET PhotoFileName=?,UpdatedAt=? WHERE StudentID=?", [filename, new Date(), studentId]);
    const actor = res.locals.auth as { userId: number };
    await db.query(
      "INSERT INTO AuditLogs (ActorUserID,ActionCode,EntityType,EntityKey,OccurredAt,DetailsJson) VALUES (?,?,?,?,?,?)",
      [actor.userId, "STUDENT_ID_PICTURE_UPLOADED", "Student", String(studentId), new Date(), JSON.stringify({ mime: detected.mime, bytes: image.length })]
    );
    res.json({ ok: true, message: "Student ID picture uploaded.", hasPhoto: true });
  } catch {
    res.status(503).json({ error: { code: "PHOTO_UPLOAD_FAILED", message: "The ID picture could not be saved. Please try again." } });
  } finally { if (db) await db.close(); }
});

export default router;
