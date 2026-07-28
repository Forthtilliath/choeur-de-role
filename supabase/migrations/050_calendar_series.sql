ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS series_id uuid;

CREATE INDEX IF NOT EXISTS calendar_events_series_id_idx
  ON calendar_events (series_id);
