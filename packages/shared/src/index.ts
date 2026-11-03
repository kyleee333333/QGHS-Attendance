import { z } from "zod";

export const UserRoleSchema = z.enum([
  "SCHOOL_ADMINISTRATOR",
  "REGISTRAR",
  "HR_PERSONNEL",
  "TEACHER",
  "PARENT_GUARDIAN",
  "STUDENT"
]);

export type UserRole = z.infer<typeof UserRoleSchema>;

export const AttendanceDirectionSchema = z.enum(["IN", "OUT"]);
export type AttendanceDirection = z.infer<typeof AttendanceDirectionSchema>;

export const TerminalScanSchema = z.object({
  scanId: z.string().uuid(),
  terminalId: z.string().min(1).max(80),
  sensorId: z.string().min(1).max(80),
  direction: AttendanceDirectionSchema,
  templateId: z.number().int().positive(),
  deviceTimestamp: z.string().datetime(),
  matchConfidence: z.number().min(0).max(100)
});

export type TerminalScan = z.infer<typeof TerminalScanSchema>;
