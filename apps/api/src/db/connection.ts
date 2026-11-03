import odbc from "odbc";
import { env } from "../config/env.js";

function requiredDatabasePath(): string {
  if (!env.ACCESS_DB_PATH) {
    throw new Error("ACCESS_DB_PATH is not configured.");
  }
  return env.ACCESS_DB_PATH;
}

function escapeConnectionValue(value: string): string {
  return value.replace(/}/g, "}}");
}

export function buildAccessConnectionString(): string {
  const driver = escapeConnectionValue(env.ACCESS_ODBC_DRIVER);
  const databasePath = escapeConnectionValue(requiredDatabasePath());
  const password = env.ACCESS_DB_PASSWORD
    ? `;PWD={${escapeConnectionValue(env.ACCESS_DB_PASSWORD)}}`
    : "";
  return `DRIVER={${driver}};DBQ={${databasePath}}${password};`;
}

export async function openAccessConnection() {
  return odbc.connect(buildAccessConnectionString());
}

export async function checkAccessConnection(): Promise<boolean> {
  const connection = await openAccessConnection();
  try {
    await connection.query("SELECT 1 AS HealthCheck");
    return true;
  } finally {
    await connection.close();
  }
}
