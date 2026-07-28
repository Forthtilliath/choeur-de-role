-- La directrice et le pianiste ne doivent pas apparaître comme "masqués" par accident
-- (valeurs par défaut du schéma) : ce sont des figures publiques du chœur.
update members
set visibility_email = true, visibility_phone = true, visibility_address = true
where email in ('camille.vidal@example.fr', 'julien.leroux@example.fr');

-- Porte le nombre de choristes qui masquent une partie de leurs données à 7
-- (sur la fourchette 6-7 souhaitée), en ajoutant 2 choristes supplémentaires.
update members set visibility_email = false, visibility_address = false
where first_name = 'Isabelle' and last_name = 'Masson';

update members set visibility_phone = false
where first_name = 'Clément' and last_name = 'Lemoine';
