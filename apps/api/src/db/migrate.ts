import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { openAccessConnection } from "./connection.js";

const migrationPath = fileURLToPath(
  new URL("../../../../database/schema/001_initial_schema.sql", import.meta.url)
);

function splitStatements(sql: string): string[] {
  const withoutComments = sql.replace(/^\s*--.*$/gm, "");
  return withoutComments
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
}

async function main(): Promise<void> {
  const sql = await readFile(migrationPath, "utf8");
  const statements = splitStatements(sql);
  const connection = await openAccessConnection();

  try {
    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log(`Applied initial QGHS CONNECT schema (${statements.length} statements).`);
  } finally {
    await connection.close();
  }
}

main().catch((error: unknown) => {
  console.error("Database migration failed.", error);
  process.exitCode = 1;
});
