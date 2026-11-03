# QGHS CONNECT attendance display

This is the student-facing display for the fingerprint terminal. It includes:
- A neutral ready-to-scan screen.
- A successful identity/attendance result showing student picture, name and LRN.
- Failure guidance for sweaty/wet fingers, unreadable fingerprints, missing enrollment, and scanner errors.

## Controller integration

The local terminal controller can call:

```js
window.QGHSAttendanceDisplay.showReady();
window.QGHSAttendanceDisplay.showFailure("sweaty"); // sweaty | unrecognized | missing | sensor
window.QGHSAttendanceDisplay.showMatch({
  displayName: "Student Full Name",
  lrn: "000000000000",
  photoUrl: "/protected/student-photo",
  attendanceSaved: true,
  timeLabel: "08:01 AM"
});
```

**Important:** call `showMatch` only after the API confirms the attendance event was saved. A fingerprint failure must never create an attendance event. A retry is allowed; if the print is worn, missing, or repeatedly unreadable, route the student to authorized staff for identity verification and an approved enrollment update. Do not permit LRN-only attendance or automatic re-enrollment at the kiosk.

The page is a display component only. It is not yet connected to the ESP32/R307 firmware or a terminal attendance API. The photo URL must be served through an authenticated, access-controlled endpoint. The screen returns to its neutral state after eight seconds to reduce exposure of the student's LRN; position the display toward the student and avoid public-facing LRN display where possible.
