# QGHS CONNECT — R307 Fingerprint Attendance Prototype

This folder adds a fingerprint-attendance prototype without overwriting your existing website files.

## Try the demo
Open `index.html` in a browser. Register a test student, click **Enroll demo fingerprint**, then enter the student's ID and choose Entrance or Exit. The prototype uses browser local storage. No real fingerprint is read or stored.

## R307 hardware plan
The R307 fingerprint module commonly communicates over UART/TTL serial. A real installation needs:
- R307 sensor and suitable power supply per the module's datasheet
- Arduino or ESP32 acting as a serial controller
- TX/RX crossed between sensor and controller, and a shared ground
- A secure server bridge to relay the sensor's verified template ID to the attendance backend
- Enrollment/verification code using a compatible fingerprint library and the module's template storage

**Do not connect sensor wires based only on wire color.** Confirm the pinout and voltage from the exact module documentation before powering it. Check whether your board's logic level is compatible; do not assume a 5 V UART signal is safe for every ESP32 input.

The browser demo is not hardware-ready. Browser JavaScript cannot directly access a typical R307 UART connection from an ordinary hosted website. A local trusted controller/bridge is required, and the backend must accept only authenticated sensor events rather than student-entered IDs.

## Node server
Run from this folder:
```sh
npm install
npm start
```
The included `package.json` is the starting backend configuration. The current demo UI is static and uses localStorage; server-side attendance endpoints and a serial bridge must be implemented and security-reviewed before the Node backend can be treated as production-ready. Running `npm install` generates `package-lock.json`.

## Deployment
GitHub Pages can host the static demo, but cannot run Node.js. For the API/bridge, use a Node-compatible host and a persistent database. Keep secrets in environment variables, use HTTPS, and configure authentication and roles.

## Privacy
This is a school-project prototype. Obtain school approval and follow applicable student-data privacy rules before real use. Do not store fingerprint images or export biometric templates. Add login/roles, server-side validation, audit logs, backups, retention rules, and a reviewed privacy/security plan before production.