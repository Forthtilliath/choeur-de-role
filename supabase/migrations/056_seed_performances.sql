-- Concerts fictifs
insert into performances (title, season_id, image_url) values
  ('Niveau Supérieur', (select id from seasons where label = '2025-2026'), '/images/performances/niveau-superieur.webp'),
  ('Partie Double', (select id from seasons where label = '2024-2025'), '/images/performances/partie-double.webp');

insert into performance_dates (performance_id, date, venue) values
  ((select id from performances where title = 'Niveau Supérieur'), '2026-05-16 20:30+02', 'Salle de l''Hexagone, Angers'),
  ((select id from performances where title = 'Partie Double'), '2025-05-17 20:30+02', 'Salle de l''Hexagone, Angers');
