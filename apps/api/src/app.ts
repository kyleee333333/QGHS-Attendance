import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env, corsOrigins } from "./config/env.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    system: "QGHS CONNECT",
    version: "2.0.0",
    environment: env.NODE_ENV,
    database: "not_checked_by_health_endpoint",
    attendanceMode: "hardware_or_explicit_test_simulator"
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found." } });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  if (env.NODE_ENV !== "production") {
    console.error(error);
  }
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: env.NODE_ENV === "production" ? "An unexpected error occurred." : message
    }
  });
});
