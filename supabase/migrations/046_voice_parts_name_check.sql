-- Drop the restrictive check constraint on voice_parts.name
-- Production data uses free-text names (e.g. 'Alto 1', 'Ténor', 'Tutti')
ALTER TABLE voice_parts DROP CONSTRAINT IF EXISTS voice_parts_name_check;
