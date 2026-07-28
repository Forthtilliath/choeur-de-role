-- Photo de Camille Vidal dans le trombinoscope (jusqu'ici absente).
-- Recadrage carré, centré sur le visage, de la même photo que celle utilisée
-- sur le bloc "Direction artistique" de l'accueil.
update members
set photo_url = '/images/camille-trombinoscope.webp'
where email = 'camille.vidal@example.fr';
