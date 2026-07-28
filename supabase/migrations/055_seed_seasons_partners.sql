-- Saisons
insert into seasons (label, active) values
  ('2024-2025', false),
  ('2025-2026', true)
on conflict (label) do nothing;

-- Partenaires fictifs
insert into partners (name, logo_url, website_url, order_index, size, active) values
  ('Ludi''Café', '/images/partners/ludi-cafe.webp', null, 0, 'current_large', true),
  ('Cave à Musique d''Anjou', '/images/partners/cave-a-musique.webp', null, 1, 'current_large', true),
  ('Impressions d''Anjou', '/images/partners/impressions-anjou.webp', null, 2, 'current_square', true),
  ('Radio Angevine', '/images/partners/radio-angevine.webp', null, 3, 'current_square', true);
