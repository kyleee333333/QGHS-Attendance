# Student Portal and Parent Email Notifications

## Student Portal

A student account is linked to exactly one student record through `StudentAccountLinks`. The portal is a signed-in, read-only student view for the first release.

### Student capabilities
- View their own basic school profile (name, student number masked where appropriate, grade level, and section).
- View their own attendance history and daily check-in/check-out status.
- View attendance summaries for a selected date range.
- View school announcements when the announcements module is implemented.

### Access rules
- A student can only read the student record linked to their authenticated account.
- Students cannot edit official identity, grade, section, or attendance records.
- Students cannot view another student's information or parent contact details.
- Staff corrections to attendance must use authorized staff workflows and be audit-logged.
- Do not expose database IDs, internal device credentials, or biometric data in portal responses.

## Parent/Guardian Email Notifications

The first release supports email notices to a parent/guardian who has an active `GuardianLinks` record and a verified email address on their user account.

### Notification types
- Attendance check-in: student identity display name, school date/time, and terminal location.
- Attendance check-out: student identity display name, school date/time, and terminal location.
- Absence alert: sent only after the school's configured attendance cutoff and after attendance records are reconciled for that school day. The alert must not be sent merely because a check-in event is delayed.

### Preferences and delivery
- `EmailNotificationPreferences` stores per-child preferences for check-in, check-out, and absence notices.
- `EmailNotificationOutbox` is a durable queue. Attendance processing should enqueue notices after the attendance event is committed; a separate mail worker sends them.
- The mail worker must re-check that the guardian link is active, the user account is active, the email is verified, and the relevant preference is enabled immediately before sending.
- Use a reputable SMTP/email provider configured through server-side environment secrets. Never place mail credentials in the web app, Android app, or Git repository.
- Retry temporary delivery failures with a bounded retry policy; record status and a non-sensitive error code. Avoid duplicate messages by making queue processing idempotent.
- Do not include sensitive student information, full student numbers, grades beyond what is needed, or any biometric data in email. Emails should direct recipients to sign in to the portal for details.
- Provide a school-approved way to correct an email address, verify it again, and opt out of non-essential notices.

## Privacy and safeguarding requirements

- The school must approve the purpose, privacy notice, lawful basis/consent process, guardian relationship verification, access roles, retention period, and incident-response procedure before real student data is used.
- A parent/guardian must not gain access merely by entering a student's name or student number. Staff must verify the relationship before creating an active guardian link.
- Do not use email as the only channel for urgent or emergency communication.
- Student portal and parent email access must be protected by authentication, authorization checks, rate limits, secure password reset, and audit logging.
- Do not store or send raw fingerprint images or templates. The attendance terminal should send only the approved mapped student reference after local sensor matching.

## Implementation status

This document and the Access schema additions define the foundation and requirements. The portal UI, authenticated API routes, email verification workflow, mail provider integration, background worker, and end-to-end tests are not yet implemented or deployed. No real messages have been sent.
