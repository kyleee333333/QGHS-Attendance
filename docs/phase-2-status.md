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
