# Database layer — Phase 2

The production database target is Microsoft Access (.accdb), accessed only by the API through the 64-bit ACE ODBC driver on a Windows host.

## Initial schema

- Schema file: database/schema/001_initial_schema.sql
- Migration entry point: pnpm --filter @qghs/api db:migrate
- Database path is configured with ACCESS_DB_PATH.
- Optional database password is configured with ACCESS_DB_PASSWORD.

The migration creates users, role assignments, students, guardian links, terminal registry, attendance events, idempotency receipts, audit logs, and human-reviewed attendance interventions.

## Important data boundaries

- Do not store raw fingerprint images or biometric templates in Access.
- The sensor performs matching locally; the terminal sends a mapped student reference only after a secure enrollment/identity mapping workflow is approved.
- Keep terminal secrets hashed at rest and never commit them.
- Keep test events distinguishable with IsTestData; production routes must reject test-mode payloads.
- Do not insert real student records until the school approves the privacy notice, purpose, retention period, access roles, and required consent/authority.

## Current limitation

The schema and ODBC connection code are implementation work, not proof that a database has been created or connected. Migration must be run on the actual Windows API host after installing the supported 64-bit Node.js runtime and Microsoft ACE ODBC driver. Back up the empty database before migration and verify each table/index in Access.

Access is a file-based database with limited concurrent-write capacity. The API must serialize writes, use parameterized queries, keep the database on a reliable local disk, and implement tested backups and restore procedures before production use.
