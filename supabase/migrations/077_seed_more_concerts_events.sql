-- Concerts et évènements fictifs supplémentaires, avec leurs affiches
insert into seasons (label, active) values ('2023-2024', false)
on conflict (label) do nothing;

insert into performances (title, season_id, image_url) values
  ('Coup de Dés', (select id from seasons where label = '2023-2024'), '/images/performances/coup-de-des.webp'),
  ('Carte Blanche', (select id from seasons where label = '2024-2025'), '/images/performances/carte-blanche.webp'),
  ('Mise en Jeu', (select id from seasons where label = '2025-2026'), '/images/performances/mise-en-jeu.webp'),
  ('Échec et Chant', (select id from seasons where label = '2026-2027'), '/images/performances/echec-et-chant.webp');

insert into performance_dates (performance_id, date, venue) values
  ((select id from performances where title = 'Coup de Dés'), '2024-03-23 20:30+01', 'Salle des fêtes, Saint-Barthélemy-d''Anjou'),
  ((select id from performances where title = 'Carte Blanche'), '2024-12-14 20:00+01', 'Église Saint-Laud, Angers'),
  ((select id from performances where title = 'Mise en Jeu'), '2025-10-11 20:30+02', 'Salle de l''Hexagone, Angers'),
  ((select id from performances where title = 'Échec et Chant'), '2027-03-20 20:30+01', 'Salle de l''Hexagone, Angers'),
  ((select id from performances where title = 'Échec et Chant'), '2027-03-21 16:00+01', 'Salle de l''Hexagone, Angers');

insert into external_events (title, location, image_url, description, external_url, published, order_index) values
  ('Fête de la Musique', 'Place du Ralliement, Angers',
   '/images/events/fete-de-la-musique.webp',
   'Le Chœur de Rôle chante sur la place du Ralliement pour la Fête de la Musique : un set d''une demi-heure, à reprendre en chœur.',
   null, true, 2),
  ('La Nuit du Jeu', 'Ludothèque municipale, Angers',
   '/images/events/nuit-du-jeu.webp',
   'Une soirée de jeux de société jusqu''à minuit à la ludothèque. Le Chœur de Rôle ouvre la soirée en chansons.',
   null, true, 3),
  ('Noël en Chœurs', 'Place Sainte-Croix, Angers',
   '/images/events/noel-en-choeurs.webp',
   'Chants de Noël sur le marché de Noël de la place Sainte-Croix, entre vin chaud et marrons grillés.',
   null, true, 4);

insert into external_event_dates (event_id, date) values
  ((select id from external_events where title = 'Fête de la Musique'), '2026-06-21 18:00+02'),
  ((select id from external_events where title = 'La Nuit du Jeu'), '2026-11-14 19:00+01'),
  ((select id from external_events where title = 'Noël en Chœurs'), '2026-12-12 16:00+01'),
  ((select id from external_events where title = 'Noël en Chœurs'), '2026-12-13 15:00+01');
