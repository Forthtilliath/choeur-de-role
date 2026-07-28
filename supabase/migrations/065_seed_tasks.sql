insert into task_categories (name, color, position) values
  ('Logistique', '#8b5cf6', 0),
  ('Communication', '#f59e0b', 1),
  ('Répertoire', '#10b981', 2)
on conflict do nothing;

insert into task_projects (name, description, is_active, created_by) values
  ('Second Tour — Organisation', 'Suivi des tâches pour le concert du 5 décembre 2026.', true,
   (select id from members where email = 'e2e.admin@test.cda.invalid'));

insert into tasks (title, description, status, priority, due_date, position, created_by, project_id, category_id) values
  ('Réserver la Salle de l''Hexagone', 'Confirmer la date et signer la convention avec la mairie.', 'done', 'high', '2026-06-15', 0,
   (select id from members where email = 'e2e.admin@test.cda.invalid'),
   (select id from task_projects where name = 'Second Tour — Organisation'),
   (select id from task_categories where name = 'Logistique')),
  ('Créer l''affiche et les flyers', 'Reprendre le visuel du concert précédent en changeant la date.', 'done', 'medium', '2026-07-10', 1,
   (select id from members where email = 'e2e.admin@test.cda.invalid'),
   (select id from task_projects where name = 'Second Tour — Organisation'),
   (select id from task_categories where name = 'Communication')),
  ('Finaliser la setlist', 'Arbitrer les 3 derniers morceaux en fonction du sondage répertoire.', 'in_progress', 'high', '2026-09-20', 2,
   (select id from members where email = 'e2e.admin@test.cda.invalid'),
   (select id from task_projects where name = 'Second Tour — Organisation'),
   (select id from task_categories where name = 'Répertoire')),
  ('Réserver le camion de matériel', 'Location pour le transport des pupitres et de la sono.', 'in_progress', 'medium', '2026-11-01', 3,
   (select id from members where email = 'e2e.admin@test.cda.invalid'),
   (select id from task_projects where name = 'Second Tour — Organisation'),
   (select id from task_categories where name = 'Logistique')),
  ('Lancer la billetterie en ligne', 'Ouvrir la vente de billets, tarifs identiques à Niveau Supérieur.', 'todo', 'high', '2026-10-01', 4,
   (select id from members where email = 'e2e.admin@test.cda.invalid'),
   (select id from task_projects where name = 'Second Tour — Organisation'),
   (select id from task_categories where name = 'Communication')),
  ('Réserver la salle pour la répétition générale', 'Créneau du 29 novembre, après-midi complet.', 'todo', 'medium', '2026-10-15', 5,
   (select id from members where email = 'e2e.admin@test.cda.invalid'),
   (select id from task_projects where name = 'Second Tour — Organisation'),
   (select id from task_categories where name = 'Logistique')),
  ('Contacter Radio Angevine', 'Proposer une interview ou une annonce du concert.', 'todo', 'low', '2026-11-10', 6,
   (select id from members where email = 'e2e.admin@test.cda.invalid'),
   (select id from task_projects where name = 'Second Tour — Organisation'),
   (select id from task_categories where name = 'Communication')),
  ('Organiser le pot après-concert', 'Boissons et grignotage pour choristes et bénévoles.', 'on_hold', 'low', null, 7,
   (select id from members where email = 'e2e.admin@test.cda.invalid'),
   (select id from task_projects where name = 'Second Tour — Organisation'),
   (select id from task_categories where name = 'Logistique'));

insert into task_assignees (task_id, member_id) values
  ((select id from tasks where title = 'Finaliser la setlist'),
   (select id from members where email = 'camille.vidal@example.fr')),
  ((select id from tasks where title = 'Finaliser la setlist'),
   (select id from members where email = 'julien.leroux@example.fr')),
  ((select id from tasks where title = 'Réserver la Salle de l''Hexagone'),
   (select id from members where email = 'e2e.admin@test.cda.invalid')),
  ((select id from tasks where title = 'Créer l''affiche et les flyers'),
   (select id from members where email = 'e2e.admin@test.cda.invalid')),
  ((select id from tasks where title = 'Réserver le camion de matériel'),
   (select id from members where email = 'e2e.admin@test.cda.invalid')),
  ((select id from tasks where title = 'Lancer la billetterie en ligne'),
   (select id from members where email = 'e2e.admin@test.cda.invalid')),
  ((select id from tasks where title = 'Contacter Radio Angevine'),
   (select id from members where email = 'e2e.admin@test.cda.invalid'));
