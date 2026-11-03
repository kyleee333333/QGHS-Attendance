# QGHS CONNECT v2 — Architecture

## Trust boundaries

```text
[Web / Expo Mobile]
        |
        | HTTPS + user JWT
        v
[Windows Defender Firewall / TLS endpoint]
        |
        v
[Express API — authentication, RBAC, validation, audit]
        |                         ^
        | parameterized ODBC      | authenticated terminal API
        v                         |
[Encrypted Access .accdb]     [ESP32 gate terminal]
                                  |
                                  +-- R307 fingerprint sensors
                                  +-- local offline scan queue

[Risk analytics] reads through the API; it does not write to Access.
```

## Core rules

1. The API is the only database gateway. Never expose or share the Access file with clients.
2. Enforce role permissions on every server route and scope parent queries to linked children.
3. Treat student and biometric data as sensitive. Use fictional test data until school approvals, consent, and privacy controls are in place.
4. Do not transmit raw fingerprint images. Sensor-side template matching returns a template ID to the terminal protocol.
5. Early-warning and dropout-risk outputs are explainable decision-support indicators, never automated decisions.
6. Simulator events must be visibly labeled TEST DATA and stored separately from real attendance.

## Access deployment constraint

The API host must be Windows with 64-bit Node.js and the 64-bit Microsoft Access Database Engine (ACE) ODBC driver. The web and mobile clients never require ACE. A standard Linux web host cannot directly run this Access-backed API architecture.
