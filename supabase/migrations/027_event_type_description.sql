-- Add description to event_types for better documentation of when to use each type
ALTER TABLE event_types ADD COLUMN description text DEFAULT NULL;
