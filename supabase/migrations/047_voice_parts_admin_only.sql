-- Add is_admin_only flag to voice_parts for special roles (chef de choeur, pianiste)
-- that should only be assignable by super_admin
ALTER TABLE voice_parts ADD COLUMN IF NOT EXISTS is_admin_only boolean NOT NULL DEFAULT false;

-- Insert special voice parts
INSERT INTO voice_parts (name, group_name, order_index, is_voice_part, is_admin_only)
VALUES
  ('Chef de chœur', 'Direction', -2, true, true),
  ('Pianiste',      'Direction', -1, true, true)
ON CONFLICT DO NOTHING;
