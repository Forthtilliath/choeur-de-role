-- Pupitres : noms propres + regroupement pour un trombinoscope plus lisible
update voice_parts set name = 'Soprano', group_name = 'Sopranes', order_index = 1 where name = 'soprano';
update voice_parts set name = 'Alto', group_name = 'Alti', order_index = 2 where name = 'alto';
update voice_parts set name = 'Ténor', group_name = 'Hommes', order_index = 3 where name = 'tenor';
update voice_parts set name = 'Basse', group_name = 'Hommes', order_index = 4 where name = 'bass';

-- Directrice artistique et pianiste (pupitres spéciaux créés en 047_voice_parts_admin_only.sql)
insert into members (email, first_name, last_name, voice_part_id, role, phone, birthday, visibility_email, visibility_phone, visibility_address, activated, onboarded_at)
values
  ('camille.vidal@example.fr', 'Camille', 'Vidal', (select id from voice_parts where name = 'Chef de chœur'), 'member', '06 12 34 56 78', '1988-04-12', true, false, false, true, now()),
  ('julien.leroux@example.fr', 'Julien', 'Leroux', (select id from voice_parts where name = 'Pianiste'), 'member', '06 87 65 43 21', '1991-09-03', true, false, false, true, now())
on conflict (email) do nothing;

insert into member_season (member_id, season_id)
select m.id, (select id from seasons where active = true)
from members m
where m.email in ('camille.vidal@example.fr', 'julien.leroux@example.fr')
on conflict do nothing;

-- 70 choristes fictifs répartis dans les 4 pupitres (générés)
insert into members (email, first_name, last_name, voice_part_id, role, phone, birthday, visibility_email, visibility_phone, visibility_address, activated, onboarded_at)
values
  ('karine.bernard@example.fr', 'Karine', 'Bernard', (select id from voice_parts where name = 'Soprano'), 'member', '06 20 57 11 46', '1977-08-03', true, false, false, true, now()),
  ('gabrielle.michel@example.fr', 'Gabrielle', 'Michel', (select id from voice_parts where name = 'Soprano'), 'member', '07 72 60 09 33', '1984-07-11', true, false, false, true, now()),
  ('isabelle.roux@example.fr', 'Isabelle', 'Roux', (select id from voice_parts where name = 'Soprano'), 'member', '07 82 99 96 52', '1970-09-16', false, false, false, false, now()),
  ('sophie.thomas@example.fr', 'Sophie', 'Thomas', (select id from voice_parts where name = 'Soprano'), 'member', '06 53 46 44 98', '1992-03-25', true, false, false, true, now()),
  ('nathalie.gerard@example.fr', 'Nathalie', 'Gérard', (select id from voice_parts where name = 'Soprano'), 'member', '07 86 80 47 69', '1976-08-10', true, false, false, true, now()),
  ('manon.brun@example.fr', 'Manon', 'Brun', (select id from voice_parts where name = 'Soprano'), 'member', '07 16 85 24 61', '1965-07-04', true, true, false, true, now()),
  ('celine.dubois@example.fr', 'Céline', 'Dubois', (select id from voice_parts where name = 'Soprano'), 'member', '07 82 41 34 36', '1992-01-11', true, true, false, true, now()),
  ('pauline.rolland@example.fr', 'Pauline', 'Rolland', (select id from voice_parts where name = 'Soprano'), 'member', '07 41 29 58 25', '1982-01-09', false, true, false, true, now()),
  ('sarah.rolland@example.fr', 'Sarah', 'Rolland', (select id from voice_parts where name = 'Soprano'), 'member', '07 27 35 21 46', '1982-10-08', true, false, false, false, now()),
  ('noemie.perrin@example.fr', 'Noémie', 'Perrin', (select id from voice_parts where name = 'Soprano'), 'member', '06 18 96 13 11', '1990-08-04', true, true, true, true, now()),
  ('gaelle.roger@example.fr', 'Gaëlle', 'Roger', (select id from voice_parts where name = 'Soprano'), 'member', '06 41 75 63 10', '1959-02-24', true, true, false, true, now()),
  ('pauline.robin@example.fr', 'Pauline', 'Robin', (select id from voice_parts where name = 'Soprano'), 'member', '07 16 02 07 98', '1999-02-20', false, false, false, false, now()),
  ('manon.blanc@example.fr', 'Manon', 'Blanc', (select id from voice_parts where name = 'Soprano'), 'member', '07 75 93 87 12', '1973-02-07', true, false, false, true, now()),
  ('julie.bernard@example.fr', 'Julie', 'Bernard', (select id from voice_parts where name = 'Soprano'), 'member', '07 75 75 97 67', '1991-10-21', true, false, false, true, now()),
  ('emilie.laurent@example.fr', 'Émilie', 'Laurent', (select id from voice_parts where name = 'Soprano'), 'member', '07 30 32 62 53', '1980-11-25', false, false, false, true, now()),
  ('lucie.renard@example.fr', 'Lucie', 'Renard', (select id from voice_parts where name = 'Soprano'), 'member', '06 22 43 84 91', '1991-05-01', false, true, false, true, now()),
  ('lea.boyer@example.fr', 'Léa', 'Boyer', (select id from voice_parts where name = 'Soprano'), 'member', '06 11 46 20 27', '1992-02-01', false, false, false, true, now()),
  ('noemie.picard@example.fr', 'Noémie', 'Picard', (select id from voice_parts where name = 'Soprano'), 'member', '06 35 52 83 32', '1979-12-23', true, true, false, true, now()),
  ('fanny.garcia@example.fr', 'Fanny', 'Garcia', (select id from voice_parts where name = 'Alto'), 'member', '06 65 61 42 33', '1981-01-13', true, true, false, true, now()),
  ('amandine.mercier@example.fr', 'Amandine', 'Mercier', (select id from voice_parts where name = 'Alto'), 'member', '07 29 68 02 91', '2003-03-08', false, false, false, true, now()),
  ('charlotte.michel@example.fr', 'Charlotte', 'Michel', (select id from voice_parts where name = 'Alto'), 'member', '06 32 90 87 81', '1977-06-26', true, false, false, true, now()),
  ('anais.chevalier@example.fr', 'Anaïs', 'Chevalier', (select id from voice_parts where name = 'Alto'), 'member', '06 66 40 82 54', '2002-01-17', false, false, false, true, now()),
  ('margaux.bertrand@example.fr', 'Margaux', 'Bertrand', (select id from voice_parts where name = 'Alto'), 'member', '06 77 44 44 61', '1953-01-17', true, false, false, true, now()),
  ('manon.morin@example.fr', 'Manon', 'Morin', (select id from voice_parts where name = 'Alto'), 'member', '07 77 12 10 82', '1977-07-09', false, false, false, true, now()),
  ('pauline.richard@example.fr', 'Pauline', 'Richard', (select id from voice_parts where name = 'Alto'), 'member', '07 24 31 76 43', '1956-07-20', true, true, false, true, now()),
  ('gaelle.legrand@example.fr', 'Gaëlle', 'Legrand', (select id from voice_parts where name = 'Alto'), 'member', '06 95 24 04 88', '2000-01-01', true, false, false, true, now()),
  ('marie.bonnet@example.fr', 'Marie', 'Bonnet', (select id from voice_parts where name = 'Alto'), 'member', '07 33 80 48 58', '1964-07-04', true, false, false, true, now()),
  ('nathalie.dupont@example.fr', 'Nathalie', 'Dupont', (select id from voice_parts where name = 'Alto'), 'member', '07 03 34 73 27', '1999-07-14', false, true, false, true, now()),
  ('lucie.morin@example.fr', 'Lucie', 'Morin', (select id from voice_parts where name = 'Alto'), 'member', '07 10 60 88 99', '1998-05-27', false, true, true, true, now()),
  ('gabrielle.brun@example.fr', 'Gabrielle', 'Brun', (select id from voice_parts where name = 'Alto'), 'member', '06 75 35 76 01', '1970-01-12', false, true, true, true, now()),
  ('emilie.picard@example.fr', 'Émilie', 'Picard', (select id from voice_parts where name = 'Alto'), 'member', '07 51 09 41 69', '1975-02-16', false, false, false, true, now()),
  ('lea.mathieu@example.fr', 'Léa', 'Mathieu', (select id from voice_parts where name = 'Alto'), 'member', '07 95 62 66 37', '1986-12-15', false, true, false, true, now()),
  ('estelle.roux@example.fr', 'Estelle', 'Roux', (select id from voice_parts where name = 'Alto'), 'member', '07 71 85 59 67', '1960-02-11', true, false, false, true, now()),
  ('anais.boyer@example.fr', 'Anaïs', 'Boyer', (select id from voice_parts where name = 'Alto'), 'member', '06 58 02 31 93', '1977-03-14', false, false, false, true, now()),
  ('julie.faure@example.fr', 'Julie', 'Faure', (select id from voice_parts where name = 'Alto'), 'member', '06 55 13 08 18', '1955-10-27', true, false, false, true, now()),
  ('benjamin.lopez@example.fr', 'Benjamin', 'Lopez', (select id from voice_parts where name = 'Ténor'), 'member', '06 25 19 35 12', '1955-01-14', false, true, false, true, now()),
  ('damien.sanchez@example.fr', 'Damien', 'Sanchez', (select id from voice_parts where name = 'Ténor'), 'member', '07 22 58 36 84', '1987-08-11', false, false, false, true, now()),
  ('jerome.fontaine@example.fr', 'Jérôme', 'Fontaine', (select id from voice_parts where name = 'Ténor'), 'member', '07 27 29 96 99', '2007-04-11', false, false, false, true, now()),
  ('theo.simon@example.fr', 'Théo', 'Simon', (select id from voice_parts where name = 'Ténor'), 'member', '06 96 61 56 47', '1998-07-05', true, false, false, true, now()),
  ('mathieu.thomas@example.fr', 'Mathieu', 'Thomas', (select id from voice_parts where name = 'Ténor'), 'member', '06 20 02 34 73', '1989-11-10', true, true, false, true, now()),
  ('ludovic.masson@example.fr', 'Ludovic', 'Masson', (select id from voice_parts where name = 'Ténor'), 'member', '07 34 68 01 56', '1959-08-04', true, false, false, true, now()),
  ('benjamin.brun@example.fr', 'Benjamin', 'Brun', (select id from voice_parts where name = 'Ténor'), 'member', '07 64 02 07 67', '2004-03-16', false, false, false, true, now()),
  ('florian.chevalier@example.fr', 'Florian', 'Chevalier', (select id from voice_parts where name = 'Ténor'), 'member', '06 79 96 62 57', '1998-01-07', false, true, false, true, now()),
  ('guillaume.renard@example.fr', 'Guillaume', 'Renard', (select id from voice_parts where name = 'Ténor'), 'member', '07 48 65 26 63', '1997-07-17', true, false, true, true, now()),
  ('olivier.petit@example.fr', 'Olivier', 'Petit', (select id from voice_parts where name = 'Ténor'), 'member', '06 94 37 77 49', '1970-12-15', true, false, false, true, now()),
  ('thomas.guerin@example.fr', 'Thomas', 'Guérin', (select id from voice_parts where name = 'Ténor'), 'member', '07 98 71 98 48', '2000-12-08', true, false, false, true, now()),
  ('julien.martin@example.fr', 'Julien', 'Martin', (select id from voice_parts where name = 'Ténor'), 'member', '06 86 14 69 82', '1997-05-28', false, false, false, false, now()),
  ('damien.lambert@example.fr', 'Damien', 'Lambert', (select id from voice_parts where name = 'Ténor'), 'member', '06 36 74 95 11', '1998-10-23', false, false, false, true, now()),
  ('emmanuel.robert@example.fr', 'Emmanuel', 'Robert', (select id from voice_parts where name = 'Ténor'), 'member', '07 59 67 54 08', '2002-11-10', true, false, false, true, now()),
  ('florian.vidal@example.fr', 'Florian', 'Vidal', (select id from voice_parts where name = 'Ténor'), 'member', '07 26 08 09 22', '1969-12-09', true, false, false, true, now()),
  ('gregory.martin@example.fr', 'Grégory', 'Martin', (select id from voice_parts where name = 'Ténor'), 'member', '07 17 33 62 12', '1982-01-09', false, false, false, true, now()),
  ('guillaume.clement@example.fr', 'Guillaume', 'Clément', (select id from voice_parts where name = 'Ténor'), 'member', '06 73 72 94 09', '1963-05-10', false, false, true, true, now()),
  ('remi.gerard@example.fr', 'Rémi', 'Gérard', (select id from voice_parts where name = 'Basse'), 'member', '06 70 17 28 47', '1974-01-14', true, true, true, true, now()),
  ('florian.morin@example.fr', 'Florian', 'Morin', (select id from voice_parts where name = 'Basse'), 'member', '07 34 06 94 76', '1965-02-25', true, false, false, true, now()),
  ('fabrice.meyer@example.fr', 'Fabrice', 'Meyer', (select id from voice_parts where name = 'Basse'), 'member', '07 32 11 87 63', '1993-07-25', true, false, false, true, now()),
  ('fabrice.leroy@example.fr', 'Fabrice', 'Leroy', (select id from voice_parts where name = 'Basse'), 'member', '07 77 99 23 87', '1988-03-05', false, true, false, false, now()),
  ('bastien.boyer@example.fr', 'Bastien', 'Boyer', (select id from voice_parts where name = 'Basse'), 'member', '07 90 38 70 43', '1996-03-04', true, false, false, true, now()),
  ('florian.gauthier@example.fr', 'Florian', 'Gauthier', (select id from voice_parts where name = 'Basse'), 'member', '07 80 58 79 08', '2005-11-02', false, false, false, true, now()),
  ('yann.dupont@example.fr', 'Yann', 'Dupont', (select id from voice_parts where name = 'Basse'), 'member', '06 41 47 69 29', '1999-08-10', false, false, false, true, now()),
  ('mickael.dumont@example.fr', 'Mickaël', 'Dumont', (select id from voice_parts where name = 'Basse'), 'member', '07 07 58 30 33', '1995-09-06', true, false, false, false, now()),
  ('romain.leroy@example.fr', 'Romain', 'Leroy', (select id from voice_parts where name = 'Basse'), 'member', '07 14 04 22 62', '1999-02-24', true, false, false, true, now()),
  ('ludovic.martin@example.fr', 'Ludovic', 'Martin', (select id from voice_parts where name = 'Basse'), 'member', '07 10 05 38 97', '1988-09-15', false, false, false, true, now()),
  ('nicolas.dubois@example.fr', 'Nicolas', 'Dubois', (select id from voice_parts where name = 'Basse'), 'member', '06 35 32 31 43', '1997-11-27', true, false, false, true, now()),
  ('theo.petit@example.fr', 'Théo', 'Petit', (select id from voice_parts where name = 'Basse'), 'member', '07 01 82 65 55', '1998-03-07', false, false, false, true, now()),
  ('florian.fournier@example.fr', 'Florian', 'Fournier', (select id from voice_parts where name = 'Basse'), 'member', '07 85 01 76 18', '1976-12-06', true, false, false, true, now()),
  ('mathieu.durand@example.fr', 'Mathieu', 'Durand', (select id from voice_parts where name = 'Basse'), 'member', '07 06 54 46 39', '1957-07-14', true, false, false, true, now()),
  ('nicolas.moreau@example.fr', 'Nicolas', 'Moreau', (select id from voice_parts where name = 'Basse'), 'member', '07 43 70 10 09', '1995-02-07', true, true, false, true, now()),
  ('emmanuel.robin@example.fr', 'Emmanuel', 'Robin', (select id from voice_parts where name = 'Basse'), 'member', '07 63 81 34 08', '2003-03-04', true, false, false, true, now()),
  ('cedric.clement@example.fr', 'Cédric', 'Clément', (select id from voice_parts where name = 'Basse'), 'member', '07 57 20 19 40', '1959-01-23', false, true, false, true, now()),
  ('adrien.vidal@example.fr', 'Adrien', 'Vidal', (select id from voice_parts where name = 'Basse'), 'member', '07 70 19 68 74', '1988-08-24', true, false, true, true, now())
on conflict (email) do nothing;

-- Inscription à la saison active
insert into member_season (member_id, season_id)
select m.id, (select id from seasons where active = true)
from members m
where m.email like '%@example.fr'
on conflict do nothing;
