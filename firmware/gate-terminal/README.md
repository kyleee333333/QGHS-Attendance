# ESP32 gate terminal

Firmware is not implemented in Phase 1. The approved terminal protocol will authenticate to the API, poll enrollment jobs, report enrollment progress, submit idempotent attendance scans, and queue scans locally while offline.

Before wiring or firmware is finalized, verify the exact R307 pinout, voltage/logic levels, ESP32 UART availability, and the actual four-sensor topology. Never assume wire colors identify pins. Never send raw fingerprint images to the API.
