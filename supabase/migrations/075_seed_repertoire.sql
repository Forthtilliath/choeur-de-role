-- Répertoire : "Dona nobis pacem" (canon traditionnel, domaine public).
-- Arrangement et pistes audio par pupitre réalisés spécifiquement pour le chœur
-- (synthèse simple, pas d'enregistrement studio) : partition + paroles + 4 pistes
-- par pupitre + un mix complet.

insert into songs (title, composer, order_index)
values ('Dona nobis pacem', 'Traditionnel', 0);

with s as (select id from songs where title = 'Dona nobis pacem')
insert into song_files (song_id, type, file_url, label, order_index)
select s.id, v.type, v.file_url, v.label, v.order_index
from s, (values
  ('score', '/repertoire/dona-nobis-pacem/partition.pdf', 'Partition (motif + entrées)', 0),
  ('lyrics', '/repertoire/dona-nobis-pacem/paroles.txt', 'Paroles (latin + traduction)', 1),
  ('audio', '/repertoire/dona-nobis-pacem/soprane.mp3', 'Piste Sopranes', 2),
  ('audio', '/repertoire/dona-nobis-pacem/alto.mp3', 'Piste Altos', 3),
  ('audio', '/repertoire/dona-nobis-pacem/tenor.mp3', 'Piste Ténors', 4),
  ('audio', '/repertoire/dona-nobis-pacem/basse.mp3', 'Piste Basses', 5),
  ('audio', '/repertoire/dona-nobis-pacem/tutti.mp3', 'Mix complet (4 voix)', 6)
) as v(type, file_url, label, order_index);

-- Liaison des pistes par pupitre à leur voice_part respectif
insert into song_file_voice_part (song_file_id, voice_part_id)
select sf.id, vp.id
from song_files sf
join songs s on s.id = sf.song_id and s.title = 'Dona nobis pacem'
join voice_parts vp on vp.name = 'Soprane'
where sf.label = 'Piste Sopranes';

insert into song_file_voice_part (song_file_id, voice_part_id)
select sf.id, vp.id
from song_files sf
join songs s on s.id = sf.song_id and s.title = 'Dona nobis pacem'
join voice_parts vp on vp.name = 'Alto'
where sf.label = 'Piste Altos';

insert into song_file_voice_part (song_file_id, voice_part_id)
select sf.id, vp.id
from song_files sf
join songs s on s.id = sf.song_id and s.title = 'Dona nobis pacem'
join voice_parts vp on vp.name = 'Ténor'
where sf.label = 'Piste Ténors';

insert into song_file_voice_part (song_file_id, voice_part_id)
select sf.id, vp.id
from song_files sf
join songs s on s.id = sf.song_id and s.title = 'Dona nobis pacem'
join voice_parts vp on vp.name = 'Basse'
where sf.label = 'Piste Basses';

-- Rattaché au prochain concert (Second Tour), cohérent avec le calendrier de répétitions
insert into song_performance (song_id, performance_id)
select s.id, p.id
from songs s, performances p
where s.title = 'Dona nobis pacem' and p.title = 'Second Tour';
