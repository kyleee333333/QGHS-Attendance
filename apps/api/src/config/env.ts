import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_HOST: z.string().default("127.0.0.1"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_CORS_ORIGINS: z.string().default("http://localhost:5173,http://localhost:8081"),
  ACCESS_DB_PATH: z.string().optional(),
  ACCESS_ODBC_DRIVER: z.string().default("Microsoft Access Driver (*.mdb, *.accdb)"),
  ACCESS_DB_PASSWORD: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error("Invalid environment configuration: " + parsed.error.message);
}

export const env = parsed.data;
export const corsOrigins = env.API_CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean);
