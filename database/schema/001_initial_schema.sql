-- QGHS CONNECT v2 — Microsoft Access initial schema
-- Apply only to a newly created, access-controlled .accdb file.
-- Never commit a populated database file or real student/biometric data.
-- Access SQL statements are separated by semicolons; do not add GO batches.

CREATE TABLE Users (
  UserID AUTOINCREMENT PRIMARY KEY,
  Username TEXT(80) NOT NULL,
  PasswordHash TEXT(255) NOT NULL,
  DisplayName TEXT(160) NOT NULL,
  Email TEXT(160),
  IsActive YESNO NOT NULL,
  CreatedAt DATETIME NOT NULL,
  UpdatedAt DATETIME NOT NULL
);

CREATE UNIQUE INDEX UX_Users_Username ON Users (Username);

CREATE TABLE UserRoles (
  UserRoleID AUTOINCREMENT PRIMARY KEY,
  UserID LONG NOT NULL,
  RoleCode TEXT(40) NOT NULL,
  AssignedAt DATETIME NOT NULL,
  CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserID) REFERENCES Users (UserID)
);

CREATE INDEX IX_UserRoles_UserID ON UserRoles (UserID);

CREATE TABLE Students (
  StudentID AUTOINCREMENT PRIMARY KEY,
  StudentNumber TEXT(40) NOT NULL,
  GivenName TEXT(80) NOT NULL,
  MiddleName TEXT(80),
  FamilyName TEXT(80) NOT NULL,
  GradeLevel TEXT(20) NOT NULL,
  SectionName TEXT(80),
  SchoolYear TEXT(20) NOT NULL,
  IsActive YESNO NOT NULL,
  CreatedAt DATETIME NOT NULL,
  UpdatedAt DATETIME NOT NULL
);

CREATE UNIQUE INDEX UX_Students_StudentNumber ON Students (StudentNumber);

CREATE TABLE GuardianLinks (
  GuardianLinkID AUTOINCREMENT PRIMARY KEY,
  UserID LONG NOT NULL,
  StudentID LONG NOT NULL,
  RelationshipCode TEXT(40) NOT NULL,
  IsActive YESNO NOT NULL,
  CONSTRAINT FK_GuardianLinks_Users FOREIGN KEY (UserID) REFERENCES Users (UserID),
  CONSTRAINT FK_GuardianLinks_Students FOREIGN KEY (StudentID) REFERENCES Students (StudentID)
);

CREATE INDEX IX_GuardianLinks_UserID ON GuardianLinks (UserID);
CREATE INDEX IX_GuardianLinks_StudentID ON GuardianLinks (StudentID);

CREATE TABLE Terminals (
  TerminalID AUTOINCREMENT PRIMARY KEY,
  TerminalCode TEXT(80) NOT NULL,
  TerminalName TEXT(120) NOT NULL,
  LocationName TEXT(120) NOT NULL,
  DeviceSecretHash TEXT(255) NOT NULL,
  IsActive YESNO NOT NULL,
  LastSeenAt DATETIME
);

CREATE UNIQUE INDEX UX_Terminals_TerminalCode ON Terminals (TerminalCode);

CREATE TABLE AttendanceEvents (
  AttendanceEventID AUTOINCREMENT PRIMARY KEY,
  StudentID LONG NOT NULL,
  TerminalID LONG,
  EventDirection TEXT(3) NOT NULL,
  EventAt DATETIME NOT NULL,
  ReceivedAt DATETIME NOT NULL,
  SourceCode TEXT(20) NOT NULL,
  VerificationCode TEXT(30) NOT NULL,
  ExternalEventID TEXT(80),
  IsTestData YESNO NOT NULL,
  CONSTRAINT FK_AttendanceEvents_Students FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
  CONSTRAINT FK_AttendanceEvents_Terminals FOREIGN KEY (TerminalID) REFERENCES Terminals (TerminalID)
);

CREATE INDEX IX_AttendanceEvents_Student_EventAt ON AttendanceEvents (StudentID, EventAt);
CREATE INDEX IX_AttendanceEvents_EventAt ON AttendanceEvents (EventAt);
CREATE INDEX IX_AttendanceEvents_ExternalEventID ON AttendanceEvents (ExternalEventID);

CREATE TABLE TerminalEventReceipts (
  ReceiptID AUTOINCREMENT PRIMARY KEY,
  TerminalCode TEXT(80) NOT NULL,
  ExternalEventID TEXT(80) NOT NULL,
  ReceivedAt DATETIME NOT NULL,
  ProcessingStatus TEXT(20) NOT NULL,
  ErrorCode TEXT(40)
);

CREATE UNIQUE INDEX UX_TerminalEventReceipts_Idempotency ON TerminalEventReceipts (TerminalCode, ExternalEventID);

CREATE TABLE AuditLogs (
  AuditLogID AUTOINCREMENT PRIMARY KEY,
  ActorUserID LONG,
  ActionCode TEXT(80) NOT NULL,
  EntityType TEXT(60) NOT NULL,
  EntityKey TEXT(80),
  OccurredAt DATETIME NOT NULL,
  SourceIP TEXT(48),
  DetailsJson LONGTEXT
);

CREATE INDEX IX_AuditLogs_OccurredAt ON AuditLogs (OccurredAt);
CREATE INDEX IX_AuditLogs_ActorUserID ON AuditLogs (ActorUserID);

CREATE TABLE AttendanceInterventions (
  InterventionID AUTOINCREMENT PRIMARY KEY,
  StudentID LONG NOT NULL,
  CreatedByUserID LONG NOT NULL,
  ReviewStatus TEXT(30) NOT NULL,
  ConcernCategory TEXT(60) NOT NULL,
  Notes LONGTEXT,
  CreatedAt DATETIME NOT NULL,
  UpdatedAt DATETIME NOT NULL,
  CONSTRAINT FK_Interventions_Students FOREIGN KEY (StudentID) REFERENCES Students (StudentID),
  CONSTRAINT FK_Interventions_Users FOREIGN KEY (CreatedByUserID) REFERENCES Users (UserID)
);

CREATE INDEX IX_Interventions_StudentID ON AttendanceInterventions (StudentID);


-- Student portal: a student account is explicitly linked to one student record.
CREATE TABLE StudentAccountLinks (
  StudentAccountLinkID AUTOINCREMENT PRIMARY KEY,
  UserID LONG NOT NULL,
  StudentID LONG NOT NULL,
  IsActive YESNO NOT NULL,
  LinkedAt DATETIME NOT NULL,
  CONSTRAINT FK_StudentAccountLinks_Users FOREIGN KEY (UserID) REFERENCES Users (UserID),
  CONSTRAINT FK_StudentAccountLinks_Students FOREIGN KEY (StudentID) REFERENCES Students (StudentID)
);

CREATE UNIQUE INDEX UX_StudentAccountLinks_UserID ON StudentAccountLinks (UserID);
CREATE UNIQUE INDEX UX_StudentAccountLinks_StudentID ON StudentAccountLinks (StudentID);

-- Parent/guardian email preferences are scoped to a verified guardian-student link.
CREATE TABLE EmailNotificationPreferences (
  EmailPreferenceID AUTOINCREMENT PRIMARY KEY,
  GuardianLinkID LONG NOT NULL,
  AttendanceCheckIn YESNO NOT NULL,
  AttendanceCheckOut YESNO NOT NULL,
  AbsenceAlert YESNO NOT NULL,
  UpdatedAt DATETIME NOT NULL,
  CONSTRAINT FK_EmailPreferences_GuardianLinks FOREIGN KEY (GuardianLinkID) REFERENCES GuardianLinks (GuardianLinkID)
);

CREATE UNIQUE INDEX UX_EmailPreferences_GuardianLinkID ON EmailNotificationPreferences (GuardianLinkID);

-- Queue only; a separate mail worker must send messages to verified guardian addresses.
CREATE TABLE EmailNotificationOutbox (
  EmailOutboxID AUTOINCREMENT PRIMARY KEY,
  GuardianLinkID LONG NOT NULL,
  AttendanceEventID LONG,
  NotificationType TEXT(30) NOT NULL,
  SubjectText TEXT(180) NOT NULL,
  BodyText LONGTEXT NOT NULL,
  DeliveryStatus TEXT(20) NOT NULL,
  AttemptCount LONG NOT NULL,
  CreatedAt DATETIME NOT NULL,
  SentAt DATETIME,
  LastErrorCode TEXT(60),
  CONSTRAINT FK_EmailOutbox_GuardianLinks FOREIGN KEY (GuardianLinkID) REFERENCES GuardianLinks (GuardianLinkID),
  CONSTRAINT FK_EmailOutbox_AttendanceEvents FOREIGN KEY (AttendanceEventID) REFERENCES AttendanceEvents (AttendanceEventID)
);

CREATE INDEX IX_EmailOutbox_Status_CreatedAt ON EmailNotificationOutbox (DeliveryStatus, CreatedAt);
CREATE INDEX IX_EmailOutbox_GuardianLinkID ON EmailNotificationOutbox (GuardianLinkID);
