-- Réponses aléatoires d'une cinquantaine de choristes, avec participation partielle
-- (certains répondent aux deux sondages, d'autres à un seul, d'autres à aucun).

-- Sondage "Choix du répertoire" : ~45 répondants
with responders as (
  select id as member_id
  from members
  where email like '%@example.fr' and role = 'member'
  order by random()
  limit 45
),
inserted_responses as (
  insert into poll_responses (poll_id, member_id)
  select (select id from polls where title = 'Choix du répertoire pour Second Tour'), member_id
  from responders
  returning id, member_id
)
insert into poll_answers (response_id, question_id, option_id)
select
  ir.id,
  (select id from poll_questions where text = 'Quel style musical préférez-vous pour le concert de décembre ?'),
  (select id from poll_options
   where question_id = (select id from poll_questions where text = 'Quel style musical préférez-vous pour le concert de décembre ?')
   order by random() limit 1)
from inserted_responses ir;

-- Sondage "Soirée de fin de saison" : ~40 répondants (tirage indépendant du précédent)
with responders as (
  select id as member_id
  from members
  where email like '%@example.fr' and role = 'member'
  order by random()
  limit 40
),
inserted_responses as (
  insert into poll_responses (poll_id, member_id)
  select (select id from polls where title = 'Soirée de fin de saison'), member_id
  from responders
  returning id, member_id
)
insert into poll_answers (response_id, question_id, option_id)
select
  ir.id,
  (select id from poll_questions where text = 'Quel format pour la soirée de fin de saison ?'),
  (select id from poll_options
   where question_id = (select id from poll_questions where text = 'Quel format pour la soirée de fin de saison ?')
   order by random() limit 1)
from inserted_responses ir;
