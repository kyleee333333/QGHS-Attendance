# Phase 1 — Foundation status

## Added to branch `qghs-connect-v2-foundation`

- pnpm workspace root and package layout
- Express + TypeScript API scaffold
- Environment validation with Zod
- Helmet, CORS allowlist, JSON request-size limit, health route, and JSON 404/error responses
- Shared role and terminal-scan schemas
- Environment example and ignore rules for secrets and Access database files
- Initial architecture and Access deployment notes

## Not yet implemented or verified

- Access ODBC repository, schema migrations, database creation and fictional seed scripts
- Authentication, password hashing, refresh-token lifecycle, RBAC middleware, and audit log
- AES-256-GCM field encryption and key rotation
- Windows firewall scripts, TLS certificate generation/validation, and security tests
- React web shell and Expo mobile shell
- Build/typecheck/test execution in a Windows environment with ACE installed

## Legacy materials reviewed

The existing `fingerprint-prototype` is a local JSON-file simulation. Its README explicitly states it does not capture real fingerprints and its server is not production-ready. Its R307 UART sketch is a serial diagnostic scaffold, not enrollment/matching firmware. Preserve it as reference material only; do not treat its local JSON store as the new database.

The old QR website is a legacy interface reference only. QR attendance is outside the approved scope of the new build.

## Hardware discrepancy to resolve before firmware implementation

The master build brief says four R307 sensors on one ESP32 with no multiplexer and says all four are confirmed working. Earlier project work discussed 74HC4067 multiplexers and reported no sensor responses during that wiring attempt. Phase 1 will not assume the four-sensor arrangement has been physically verified; Phase 3 must validate the actual wiring and UART topology before firmware claims are made.
