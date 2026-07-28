-- Bureau de l'association (9 membres élus parmi les choristes, rôles attitrés).
-- role passe à 'ca' pour donner accès aux pages réservées au bureau (CA, tâches...).

update members set role = 'ca', bureau_role = 'Présidente'
where first_name = 'Céline' and last_name = 'Bourgeois';

update members set role = 'ca', bureau_role = 'Vice-président'
where first_name = 'Thomas' and last_name = 'Gautier';

update members set role = 'ca', bureau_role = 'Trésorière'
where first_name = 'Gabrielle' and last_name = 'Fournier';

update members set role = 'ca', bureau_role = 'Trésorier adjoint'
where first_name = 'Antoine' and last_name = 'Garcia';

update members set role = 'ca', bureau_role = 'Secrétaire'
where first_name = 'Nathalie' and last_name = 'Lopez';

update members set role = 'ca', bureau_role = 'Secrétaire adjointe'
where first_name = 'Karine' and last_name = 'Barbier';

update members set role = 'ca', bureau_role = 'Responsable communication'
where first_name = 'Cédric' and last_name = 'Lucas';

update members set role = 'ca', bureau_role = 'Responsable logistique'
where first_name = 'Grégory' and last_name = 'Gérard';

update members set role = 'ca', bureau_role = 'Bibliothécaire (partitions)'
where first_name = 'Manon' and last_name = 'Robert';
