-- Photos de Julien Leroux (pianiste) : avatar trombinoscope + photo du bloc d'accueil.
-- Portrait Unsplash (licence standard, gratuite), recadré sur le visage pour les deux usages.
update members
set photo_url = '/images/julien-trombinoscope.webp'
where email = 'julien.leroux@example.fr';

update home_blocks
set image_url = '/images/julien-home.webp'
where content like '%Notre pianiste%';
