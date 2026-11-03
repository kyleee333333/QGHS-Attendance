import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env, corsOrigins } from "./config/env.js";
import { checkAccessConnection } from "./db/connection.js";
import authRoutes from "./routes/auth.js";
import studentPortalRoutes from "./routes/portal.js";
import parentRoutes from "./routes/parent.js";
import parentProfileRoutes from "./routes/parent-profile.js";

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

app.use("/api/auth", authRoutes);
app.use("/api/portal", studentPortalRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/parent", parentProfileRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    system: "QGHS CONNECT",
    version: "2.0.0",
    environment: env.NODE_ENV,
    database: "use_database_health_endpoint",
    attendanceMode: "physical_terminal_only"
  });
});

app.get("/api/health/database", async (_req, res) => {
  try {
    await checkAccessConnection();
    res.status(200).json({ ok: true, database: "connected" });
  } catch {
    res.status(503).json({
      ok: false,
      database: "unavailable",
      message: "The Access database is not configured or cannot be reached."
    });
  }
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
