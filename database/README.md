# Microsoft Access database

The production database is an encrypted Microsoft Access `.accdb` file on the Windows API host.

Rules:
- Only the Express API opens the file.
- Never place the database in a public repository or network share.
- Use parameterized Access-compatible SQL in `apps/api/src/db`.
- Use a single serialized write queue, short transactions, a small connection pool, retry/backoff for lock errors, and idempotent terminal scan IDs.
- Version schema changes as ordered SQL scripts and record applied versions in `schema_migrations`.
- Integration tests must use a real temporary `.accdb` on Windows with ACE installed.
- Keep fictional seed records separate from real school records.

Access limitations to plan around: 2 GB file limit, file-based locking and limited write concurrency, no stored procedures, and no PostgreSQL-style `RETURNING` or `LIMIT`. Use `TOP`, generated IDs, Access Yes/No and Date/Time types, and bracket reserved identifiers.

The setup script, schema migrations, repository implementation, archive/backup jobs, and real-ACCDB tests are Phase 1 deliverables still to be added.
