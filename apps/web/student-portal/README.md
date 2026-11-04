# Student Portal

Static web client for the authenticated student portal. Configure `window.QGHS_API_BASE` before loading `portal.js` to point to the school's HTTPS API.

The page expects the API contract documented in `docs/portal-api-contract.md`. Until the protected API routes and school database are implemented, sign-in and data loading will fail closed. No sample student records are embedded.

Serve this directory from a web server; do not open it as a local file for production use. Never put credentials or tokens in localStorage. Production must use HTTPS and an approved secure session strategy.

## Student ID picture upload

Staff upload page: `photo-admin.html` (serve it from the same trusted web origin as the student portal).
- Staff/admin sign in using an account assigned exactly one `staff` or `admin` role.
- Search an active student by LRN, student number, or name.
- Upload one complete school-issued ID image (JPG, PNG, or WEBP; maximum 5 MB).
- The image is stored outside the public web root in the server directory configured by `STUDENT_PHOTO_DIR`; the database stores only its generated filename.
- The student portal retrieves the image only after the linked student account authenticates.
- API upload endpoint: `PUT /api/admin/students/:studentId/id-picture` with the raw image body and its matching image content type.
- Staff search endpoint: `GET /api/admin/students/search?term=...`.

Before enabling this feature with real records, configure a private photo directory, TLS, staff account provisioning, database backups, school authorization, and the school's student-data privacy procedures. Do not place real ID pictures in GitHub or a public assets directory.

The upload route and interface are committed to the development branch, but have not yet been built or tested against a real Access database. The student portal and fingerprint terminal are not yet a live production service.
