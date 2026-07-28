-- Nouvelle saison en cours (2025-2026 est maintenant terminée)
insert into seasons (label, active) values ('2026-2027', true)
on conflict (label) do nothing;

update seasons set active = false where label = '2025-2026';

insert into performances (title, season_id, image_url) values
  ('Second Tour', (select id from seasons where label = '2026-2027'), '/images/performances/second-tour.webp');

insert into performance_dates (performance_id, date, venue) values
  ((select id from performances where title = 'Second Tour'), '2026-12-05 20:30+01', 'Salle de l''Hexagone, Angers');
