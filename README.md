# QGHS CONNECT v2

Fresh monorepo foundation for Quirino General High School's school information and fingerprint attendance system.

## Important architecture decisions

- The Express API is the only process allowed to open the Microsoft Access database.
- The API must run on Windows with the 64-bit Microsoft Access Database Engine (ACE) ODBC driver installed. Node.js must be 64-bit too.
- Web, mobile, and ESP32 clients communicate with the API; they never access the database file directly.
- Development data must be fictional and use reserved `.test` email addresses.
- The simulator must clearly label all generated events as test data.
- Early-warning and dropout-risk outputs are decision-support indicators only.
- No enrollment-management workflow, CCTV, QR attendance, RFID, peer exchange, lost-and-found, or suggestion-voting modules are in scope.

## Repository layout

- `apps/api`: Express + TypeScript API and Access repository layer
- `apps/web`: React web application
- `apps/mobile`: Expo / React Native application
- `packages/shared`: shared types and Zod schemas
- `firmware/gate-terminal`: ESP32 gate terminal firmware
- `tools/terminal-simulator`: test-only terminal simulator
- `database`: versioned Access SQL scripts and database setup utilities
- `ops`: Windows firewall and TLS scripts
- `docs`: architecture, privacy, operations, and user documentation

## Phase 1 status

This branch establishes the workspace and API foundation. The Access adapter, authentication, RBAC, migrations, encryption, firewall/TLS scripts, and UI shells are being implemented and tested in subsequent Phase 1 steps. A successful API health response does not prove Access connectivity or production readiness.

## Local setup

1. Install 64-bit Node.js LTS and pnpm.
2. On the Windows API host, install the 64-bit Microsoft Access Database Engine.
3. Copy `.env.example` to `.env` and replace every placeholder with locally generated values.
4. Run `pnpm install`.
5. Run `pnpm dev:api`.

Never commit `.env`, a real `.accdb`, student records, biometric templates, or real guardian contact information.
