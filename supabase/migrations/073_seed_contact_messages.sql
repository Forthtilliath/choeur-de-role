insert into contact_messages (category, first_name, last_name, email, phone, message, read, created_at) values
(
  'rejoindre', 'Marine', 'Cosnard', 'marine.cosnard@mailfictif.fr', '06 45 12 78 33',
  'Bonjour, je chante dans une chorale amateur depuis 3 ans (plutôt alto) et je déménage à Angers en septembre. Est-ce que le Chœur de Rôle accepte de nouveaux membres en cours de saison, et faut-il passer une audition ?',
  true, now() - interval '38 days'
),
(
  'rejoindre', 'Yohann', 'Prigent', 'y.prigent@mailfictif.fr', null,
  'Salut ! Je ne sais absolument pas chanter juste mais j''adore les jeux de société et l''ambiance de vos photos me donne trop envie. C''est ouvert aux grands débutants ou il faut déjà avoir de l''expérience ?',
  true, now() - interval '29 days'
),
(
  'partenariat', 'Sophie', 'Delaunay', 'sophie.delaunay@ludicafe-angers.fr', '02 41 88 20 14',
  'Bonjour, je suis la gérante du Ludi''Café. On a adoré vous accueillir pour vos soirées jeux entre choristes ! On aimerait proposer un partenariat plus officiel pour la saison prochaine (affichage, réduction pour les membres). Qui contacter pour en discuter ?',
  true, now() - interval '52 days'
),
(
  'autre', 'Bertrand', 'Aumont', 'b.aumont@mailfictif.fr', '06 72 90 14 55',
  'Bonjour, je suis programmateur pour la médiathèque d''Avrillé. On organise un cycle "musique et cultures de l''imaginaire" au printemps prochain et le nom de votre chœur nous a fait sourire. Seriez-vous intéressés par une petite prestation ?',
  false, now() - interval '11 days'
),
(
  'rejoindre', 'Camille', 'Bethune', 'camille.bethune@mailfictif.fr', '07 61 45 20 09',
  'Bonjour, ténor de formation (10 ans de conservatoire), je viens d''arriver à Angers pour le travail. Vos répétitions sont bien le mardi soir ? Je suis dispo à partir de la rentrée.',
  false, now() - interval '6 days'
),
(
  'partenariat', 'Nadia', 'Kerouac', 'n.kerouac@impressions-anjou.fr', '02 41 55 30 82',
  'Bonjour, suite à notre collaboration sur les visuels du concert "Second Tour", on souhaiterait proposer un tarif préférentiel à l''année pour tous vos futurs impressions (affiches, flyers, programmes). Dispo pour un rendez-vous quand vous voulez.',
  true, now() - interval '65 days'
),
(
  'autre', 'Elise', 'Vannier', 'elise.vannier@mailfictif.fr', null,
  'Bonjour, je voulais juste dire que je suis venue voir "Niveau Supérieur" avec mon conjoint sans trop savoir à quoi m''attendre, et on a passé un moment incroyable. Merci à tout le chœur, on reviendra pour le prochain concert !',
  true, now() - interval '80 days'
),
(
  'autre', 'Fabrice', 'Onillon', 'f.onillon@mailfictif.fr', '06 33 87 41 20',
  'Bonjour, la salle où vous répétez est-elle accessible en fauteuil roulant ? Ma fille aimerait venir assister à une répétition avant de se décider à s''inscrire.',
  false, now() - interval '3 days'
),
(
  'rejoindre', 'Guillaume', 'Peltier', 'g.peltier@mailfictif.fr', '07 84 20 11 63',
  'Basse dans la chorale de mon ancien village, je cherche un chœur plus dynamique depuis mon arrivée à Trélazé. Vos concerts sur les réseaux ont l''air vraiment sympas. Comment se passe la reprise en septembre ?',
  false, now() - interval '9 days'
),
(
  'partenariat', 'Thibault', 'Rocher', 'contact@radio-angevine.fr', '02 41 20 63 47',
  'Bonjour, on prépare une émission spéciale "chorales angevines" pour la rentrée et on aimerait vous inviter en studio pour en parler et diffuser un extrait de votre dernier concert. Vous seriez disponibles en septembre ?',
  true, now() - interval '20 days'
),
(
  'autre', 'Corinne', 'Le Bihan', 'corinne.lebihan@mailfictif.fr', '06 19 44 72 08',
  'Bonjour, mon fils de 16 ans chante très bien et voudrait rejoindre un chœur mais toutes vos infos parlent de choristes adultes. Y a-t-il un âge minimum ?',
  false, now() - interval '2 days'
);
