# Student and Parent Portal API Contract

This contract defines the endpoints used by the web clients. These endpoints are **not implemented yet**; clients fail closed until they exist.

## Authentication
- `POST /api/auth/login` — accepts username/password; returns short-lived access token only after password verification and active-account check. Apply rate limiting and generic invalid-credentials errors.
- Tokens must be signed using a strong server-side secret, expire quickly, and be held in memory by these clients. Production deployment must use HTTPS.
- Role authorization is required on every protected endpoint. UI visibility is not authorization.

## Student
- `GET /api/portal/me` — requires `student` role; return only the student record linked to the authenticated user through StudentAccountLinks. Never accept a student ID from the client to choose the record.
- `GET /api/portal/attendance` — requires `student` role; query attendance only for the authenticated user's linked student record. Limit results and support server-validated date filters.

## Parent / guardian
- `GET /api/parent/me` — requires `parent` role and active verified GuardianLinks; return only the guardian and linked child context.
- `GET /api/parent/attendance` — return attendance only for the active verified guardian-child relationship. Do not accept arbitrary student IDs.
- `GET /api/parent/notification-preferences` and `PUT /api/parent/notification-preferences` — read/update preferences only for the authenticated guardian's active link. Validate booleans and audit changes.

## Email notification processing
- Attendance processing should enqueue a notification only after the attendance event is committed.
- A separate worker must re-check guardian link, active account, verified email, and opt-in preference before sending.
- Use server-side SMTP credentials, TLS, bounded retries, idempotent processing, and non-sensitive delivery logs. Do not put SMTP credentials in browser/mobile code.
- Absence notices must wait until the school's configured attendance cutoff and reconciliation window; a delayed event must not trigger a false absence alert.
- Email body should be minimal and direct the recipient to the authenticated portal for details.

## Response and privacy requirements
- Use generic errors for authentication failures; never disclose whether a username or email exists.
- Do not return passwords, password hashes, email verification tokens, device secrets, internal database IDs, or biometric templates.
- Do not return raw fingerprint data. The sensor should perform matching locally.
- Enforce pagination, input validation, audit logging, rate limits, and least-privilege access.
- Real student/guardian data must not be used until the school approves the privacy notice, lawful basis/consent process, relationship verification, retention schedule, and authorized access roles.
