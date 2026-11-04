# QGHS CONNECT — Website and Android launch readiness

## What is prepared in this branch

- Student portal web client: `apps/web/student-portal/index.html`
- Student profile displays the linked student's name and LRN, and loads their uploaded ID picture through an authenticated API request.
- Staff-only ID picture upload page: `apps/web/student-portal/photo-admin.html`
- Staff search/upload API source: `apps/api/src/routes/student-photo-admin.ts`
- Installable Progressive Web App (PWA) manifest, icons, and offline static-shell cache for the student portal.
- Parent portal source remains under `apps/web/parent-portal/`.
- API and Microsoft Access schema source remain under `apps/api/` and `database/schema/`.

## Website and Android delivery

The student portal is currently a web client that can be installed from a supported Android browser as a PWA after it is served over HTTPS. This is not a signed native Android APK/AAB. There is no Android/Expo application package in this branch yet.

The web client requires the school API. Do not publish a public sign-in page that points to `localhost`; that address refers to each visitor's own device, not the school's server. Configure `window.QGHS_API_BASE` to the real HTTPS API origin before deployment. Do not cache API responses, student photos, tokens, or student records in the service worker.

## Required before any production launch

1. Choose the hosting/network plan. A Windows laptop can host the API and Access database for a controlled local-network pilot, but it must remain powered on and connected. Public internet access requires an approved secure hosting/network design; do not expose the Access file or raw ODBC port to the internet.
2. On the Windows host, install supported 64-bit Node.js, Microsoft Access Database Engine/ACE ODBC driver, and pnpm. Create or back up the Access database, then run and verify the migration.
3. Configure local environment variables outside Git: `ACCESS_DB_PATH`, `STUDENT_PHOTO_DIR`, a strong random `JWT_ACCESS_SECRET`, allowed HTTPS CORS origins, and approved SMTP credentials. Never commit secrets.
4. Update API CORS to the final website origin and configure HTTPS/TLS. Set the website's `window.QGHS_API_BASE` to the real API address.
5. Provision accounts and student/guardian links using authorized staff procedures. Verify staff email addresses and roles. Confirm that student accounts can only access their own record and parents only their linked children.
6. Complete the school privacy review before entering real student records or ID photos: purpose, notice/consent or other lawful basis, access roles, retention/deletion, incident response, backups, and authorized staff. Obtain approval from the school's Data Protection Officer/privacy lead.
7. Build and typecheck the API; test database migration, login, photo upload and retrieval, parent/student authorization, email delivery, backups/restores, and error handling.
8. Connect the fingerprint terminal to a server-side attendance endpoint and verify saved events before displaying success. A failed or sweaty/unreadable scan must not create an attendance event; staff-assisted identity verification must follow school policy.
9. Run a controlled pilot with test accounts and test data. Only announce production availability after the school approves the pilot and operational checks pass.

## Current limitations (do not describe as launched)

- This source branch has not yet passed a complete install, build, typecheck, or end-to-end test.
- The Access database has not been created/migrated/tested on the actual Windows laptop.
- No production API or public website has been deployed.
- SMTP credentials and end-to-end parent email delivery have not been tested; terminal attendance ingestion is not wired to the email queue.
- The new student photo upload route has not been tested against Access or under a production reverse proxy.
- The Android install path is PWA installation through a browser; a native APK/AAB still needs a separate Android project and release signing.
- The fingerprint display is not yet integrated with the ESP32/R307 terminal's confirmed server-side attendance flow.

## Safe release rule

Do not use real student LRNs, ID pictures, attendance records, or guardian contact details in a public demo. Keep the GitHub repository free of student data, database files, photos, passwords, tokens, and provider credentials.
