# Phase 2 — Database foundation

## Implemented in source

- Initial Microsoft Access schema for users, role assignments, students, guardian links, terminal registry, attendance events, idempotency receipts, audit logs, and human-reviewed attendance interventions.
- Unique/indexed keys for usernames, student numbers, terminal codes, event lookup, and terminal idempotency.
- ODBC connection helper using environment configuration; connection secrets are not hard-coded.
- Initial schema migration entry point.

## Not yet verified

- No Access database file has been created or migrated.
- No Windows host or ACE ODBC driver is available in this deployment session.
- ODBC compilation and runtime behavior have not been tested against the target machine.
- Authentication, authorization middleware, password reset, terminal credential issuance, rate limiting, and audit-write integration remain Phase 3 work.
- No real student or biometric data has been loaded.

## Required before real records

The school must approve the data-processing purpose, privacy notice, retention/deletion schedule, authorized roles, guardian/student notices and consent/other lawful basis, incident response, backup location, and access-control procedure. Validate the plan with the school's Data Protection Officer or authorized privacy lead.

## Added scope: student portal and parent email foundation

- Added a one-to-one student account link table for the student portal.
- Added verified-email timestamp support on user accounts.
- Added per-guardian attendance email preferences and a durable email outbox table.
- Documented student-only record access, parent/guardian verification, notification types, delivery safeguards, and privacy requirements in `docs/student-portal-parent-email.md`.
- These are schema and requirements only. Student portal screens/API, authentication/authorization, email verification, provider integration, mail worker, and end-to-end delivery tests are not yet implemented.

## Portal interface work added

- Added a student portal web interface under `apps/web/student-portal/` with sign-in, own-profile summary, and attendance-history view. It calls the documented API contract and does not embed sample student data.
- Added a parent/guardian portal under `apps/web/parent-portal/` with linked-child attendance view and email notification preference controls.
- Added `docs/portal-api-contract.md` for the protected routes and notification delivery behavior expected by both clients.
- The web clients are interface/integration scaffolds only. The API authentication, protected portal routes, guardian relationship enforcement, email verification, SMTP integration, and mail worker are not implemented. The pages therefore cannot sign in or send emails yet.
- No live website deployment or production database connection has been performed.

## Secure login and parent email implementation added

- Added database-backed login route at `POST /api/auth/login`, scrypt password verification, short-lived signed access tokens, role middleware, and failed-login throttling.
- Added protected student profile and attendance routes, and parent profile, linked-child attendance, and notification-preference routes.
- Added a local-only account provisioning helper at `apps/api/src/admin/create-account.ts`; public self-registration is not provided.
- Added server-side SMTP mailer, attendance-notice outbox queue helper, and a separate polling worker (`pnpm --filter @qghs/api email:worker`).
- Added parent preference and verified-email checks before queued notices are sent.

### Not yet production-ready

- No live Access database or SMTP provider has been configured or tested; no end-to-end build/typecheck has been confirmed.
- Physical terminal attendance ingestion is not yet wired to the email queue helper, so end-to-end automatic notifications are not active.
- Absence-alert cutoff scheduling, email-address verification workflow, persistent distributed login throttling, session revocation, worker leasing/transactional claiming, and automated integration tests remain outstanding.
- Do not load real student or guardian data until QGHS authorizes the privacy, access, retention, and operational controls.


## Student identity and fingerprint display added

- Added the student identification card to the student portal profile, displaying the student's name and LRN with a portrait when an approved photo is available.
- Added `Students.LRN` and `Students.PhotoFileName` to the initial schema, plus the one-time upgrade script `database/schema/002_student_identity_fields.sql` for existing databases.
- Added an authenticated student-photo endpoint. Photo files must be stored outside the public web root in the private folder configured by `STUDENT_PHOTO_DIR`; only the linked student can retrieve their own photo.
- Added a fingerprint attendance display page with ready, success, and scan-failure states. It provides retry guidance for sweaty/wet fingers and routes missing or unreadable prints to authorized staff for identity verification.
- The attendance display is a UI component only. It is **not yet connected** to ESP32/R307 firmware or a terminal attendance API. A controller must call the documented display bridge only after the API confirms a saved attendance event.
- A failed scan must never create an attendance event. LRN-only attendance and automatic kiosk re-enrollment are not allowed. The display returns to a neutral screen after eight seconds to limit LRN exposure.

### Remaining setup and verification

- Apply the schema upgrade to an existing Access database, or create a new database from the updated initial schema.
- Configure the private student photo directory and populate approved photo filenames through an authorized staff workflow.
- Build and test the API and portal; verify that photo access is limited to the authenticated student's own record.
- Integrate the attendance display with the actual terminal controller and server-side event confirmation.
- Test wet-finger, unreadable/worn print, missing enrollment, scanner disconnect, duplicate scan, and staff-assisted verification scenarios before school use.
