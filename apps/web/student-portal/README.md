# Student Portal

Static web client for the authenticated student portal. Configure `window.QGHS_API_BASE` before loading `portal.js` to point to the school's HTTPS API.

The page expects the API contract documented in `docs/portal-api-contract.md`. Until the protected API routes and school database are implemented, sign-in and data loading will fail closed. No sample student records are embedded.

Serve this directory from a web server; do not open it as a local file for production use. Never put credentials or tokens in localStorage. Production must use HTTPS and an approved secure session strategy.
