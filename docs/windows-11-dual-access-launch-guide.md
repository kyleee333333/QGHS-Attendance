# QGHS CONNECT — Windows 11 dual-access launch plan

This guide prepares one authoritative Windows laptop host for both school-LAN access and approved public HTTPS access. The Microsoft Access database and student ID photographs remain on the laptop. Do not expose the database file, ODBC port, or Windows file sharing to the internet.

## Target layout

- Windows 11 laptop: API, Microsoft Access database, private ID-photo directory, backups.
- School LAN: student/staff devices reach the API through the laptop's private LAN address.
- Public website: static portal files served over HTTPS.
- Public API: a managed HTTPS tunnel/reverse proxy to the API on the laptop, only after security and school privacy approval.
- Android: install the PWA from the HTTPS student portal. A native APK/AAB is a separate deliverable and is not included in this repository yet.

## Phase A — prepare Windows 11

1. Keep the laptop plugged in, updated, protected by Windows Defender, and set not to sleep during approved operating hours.
2. Install supported 64-bit Node.js LTS, Git, pnpm 10.20.0, and the 64-bit Microsoft Access Database Engine/ACE ODBC driver.
3. Confirm the ODBC driver appears in the 64-bit ODBC Data Sources app under Drivers.
4. Clone the repository and switch to `qghs-connect-v2-foundation`.
5. In the repository root run:
   ```powershell
   corepack enable
   corepack prepare pnpm@10.20.0 --activate
   pnpm install
   pnpm --filter @qghs/api typecheck
   pnpm --filter @qghs/api build
   ```
   Do not proceed to production if either check fails. Resolve dependency/lockfile and TypeScript errors first.

## Phase B — create the private local environment

1. Copy `.env.example` to `apps/api/.env` (or the API's documented dotenv working directory) and set real values locally only. Never commit this file.
2. Set:
   - `NODE_ENV=production` only after production configuration is verified.
   - `API_HOST=0.0.0.0` only if the API must accept connections from the school LAN. If it is tunnel-only, bind to `127.0.0.1`.
   - `API_PORT=4000`.
   - `ACCESS_DB_PATH` to the actual local .accdb file.
   - `STUDENT_PHOTO_DIR` to a private NTFS folder outside the repository and all public web folders.
   - `JWT_ACCESS_SECRET` to at least 32 cryptographically random bytes.
   - `API_CORS_ORIGINS` to exact trusted HTTPS portal origins and any local pilot origins; do not use a wildcard.
   - Configure SMTP only after the school approves the sender account.
3. Create the private database/photo/backup directories with Windows permissions limited to the dedicated service account and authorized administrators.
4. Back up any existing database before migration. Run the migration on a copy first, inspect the tables and indexes in Access, and verify the database health endpoint.
5. Create staff/student/guardian accounts and links through authorized procedures. Do not import real records until the school privacy lead authorizes the system.

## Phase C — local network pilot

1. Start the API on the laptop and confirm `http://127.0.0.1:4000/api/health` and `/api/health/database`.
2. If LAN access is enabled, allow inbound TCP 4000 only from the school's trusted private subnet using Windows Firewall. Never create a public router port-forward.
3. Configure each portal's API base URL to the laptop's private LAN address for the LAN pilot.
4. Test staff login, student login, correct student-to-account links, student photo upload/retrieval, parent linked-child restrictions, and attendance access with test accounts only.
5. Confirm another device on the same school Wi-Fi can reach the API, but a device outside the LAN cannot reach the private API directly.

## Phase D — public access

Public access is NOT enabled by this repository commit. Before enabling it:
1. Obtain school administration and privacy-lead approval for internet access to student data.
2. Use a managed HTTPS tunnel/reverse proxy with strong account access controls and MFA for administrators. The tunnel should connect to the API locally at `http://127.0.0.1:4000`; do not expose TCP 4000 on the router or internet.
3. Put the static portal behind HTTPS. Set `window.QGHS_API_BASE` to the exact public API HTTPS origin and configure that exact portal origin in API CORS.
4. Add persistent rate limiting, session revocation, account recovery, email verification, security logging/monitoring, backup restore drills, and a tested single-worker email outbox lease before public release.
5. Test TLS, CORS, unauthorized access, role isolation, student/guardian record boundaries, photo access, and outage recovery from an external network.

## Phase E — Android

- The student portal contains a web app manifest and service worker. Once hosted on HTTPS, open the portal in Chrome on Android and choose Install app / Add to Home screen.
- The service worker caches only the static app shell. Never cache API responses, tokens, student photos, LRN values, or attendance records.
- A signed native APK/AAB requires a separate Android application project, package ID, signing key, privacy disclosures, and device testing. No native APK is currently present.

## Current release blockers

- The code has not yet passed a clean dependency install, build, typecheck, or end-to-end test.
- The repository has no production .accdb file and no verified ACE ODBC runtime on the target laptop.
- The current API default host is loopback; LAN operation requires an explicit host/network configuration.
- The web client currently defaults to `http://localhost:4000`; public deployment must configure the real HTTPS API origin. Never leave localhost as the public API address.
- Student-photo upload and staff/student/parent routes need testing against the real schema. The photo upload route should be reviewed for transactional cleanup and file replacement behavior before production.
- Login throttling is in-memory only; the email worker has no multi-worker lease; email verification and account recovery are incomplete.
- Attendance terminal ingestion and automatic email notifications are not end-to-end connected.
- No public website, API tunnel, or signed Android APK/AAB has been deployed.
- Microsoft Access is a file-based database and may not be suitable for a large number of concurrent public users. Run a load/concurrency test; consider migrating to a server database before broad public launch.

## Go-live rule

Only use synthetic test accounts until the school authorizes the data processing and the release gates above pass. Never put student LRNs, ID images, attendance records, guardian details, database files, credentials, or tokens in GitHub.
