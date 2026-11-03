-- Apply once to an existing QGHS CONNECT database that was created before student identity fields were added.
ALTER TABLE Students ADD COLUMN LRN TEXT(12);
ALTER TABLE Students ADD COLUMN PhotoFileName TEXT(120);
