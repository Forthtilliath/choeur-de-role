insert into external_events (title, location, image_url, description, external_url, published, order_index) values
  ('Festival des Chœurs d''Anjou', 'Parc des expositions, Angers',
   '/images/events/festival-choeurs-anjou.webp',
   'Une journée de chant choral avec une dizaine de chorales du Maine-et-Loire. Le Chœur de Rôle y interprète deux morceaux de son répertoire.',
   null, true, 0),
  ('Angers Ludique', 'Parc des expositions, Angers',
   '/images/events/angers-ludique.webp',
   'Le rendez-vous des passionnés de jeux de société à Angers — animations, tournois, et une intervention chantée du Chœur de Rôle sur le thème du jeu.',
   null, true, 1);

insert into external_event_dates (event_id, date) values
  ((select id from external_events where title = 'Festival des Chœurs d''Anjou'), '2026-06-14 14:00+02'),
  ((select id from external_events where title = 'Angers Ludique'), '2026-10-03 10:00+02'),
  ((select id from external_events where title = 'Angers Ludique'), '2026-10-04 10:00+02');
