insert into polls (title, description, closes_at, is_active, created_by) values
  ('Choix du répertoire pour Second Tour', 'Aidez-nous à orienter le programme musical du prochain concert.', '2026-09-15 23:59:00+02', true,
   (select id from members where email = 'e2e.admin@test.cda.invalid')),
  ('Soirée de fin de saison', 'On cherche un format pour fêter la fin de saison ensemble.', '2026-11-01 23:59:00+01', true,
   (select id from members where email = 'e2e.admin@test.cda.invalid'));

insert into poll_questions (poll_id, text, type, required, order_index) values
  ((select id from polls where title = 'Choix du répertoire pour Second Tour'),
   'Quel style musical préférez-vous pour le concert de décembre ?', 'single_choice', true, 0),
  ((select id from polls where title = 'Soirée de fin de saison'),
   'Quel format pour la soirée de fin de saison ?', 'single_choice', true, 0);

insert into poll_options (question_id, label, order_index) values
  ((select id from poll_questions where text = 'Quel style musical préférez-vous pour le concert de décembre ?'), 'Variété française', 0),
  ((select id from poll_questions where text = 'Quel style musical préférez-vous pour le concert de décembre ?'), 'Comédies musicales', 1),
  ((select id from poll_questions where text = 'Quel style musical préférez-vous pour le concert de décembre ?'), 'Musiques de films et jeux vidéo', 2),
  ((select id from poll_questions where text = 'Quel style musical préférez-vous pour le concert de décembre ?'), 'Classique revisité', 3),
  ((select id from poll_questions where text = 'Quel format pour la soirée de fin de saison ?'), 'Repas partagé', 0),
  ((select id from poll_questions where text = 'Quel format pour la soirée de fin de saison ?'), 'Pique-nique', 1),
  ((select id from poll_questions where text = 'Quel format pour la soirée de fin de saison ?'), 'Soirée jeux de société', 2),
  ((select id from poll_questions where text = 'Quel format pour la soirée de fin de saison ?'), 'Karaoké', 3);
