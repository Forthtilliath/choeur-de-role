-- Albums
insert into gallery_albums (title, description, cover_url, performance_id, order_index, published, album_type) values
  ('Niveau Supérieur — le concert', 'Quelques images du concert de mai 2026.', '/images/gallery/g-concert-2.webp',
   (select id from performances where title = 'Niveau Supérieur'), 0, true, 'photos'),
  ('Coulisses & répétitions', 'Ambiance des répétitions du mardi soir.', '/images/gallery/g-repet-1.webp',
   null, 1, true, 'photos'),
  ('Vidéos', 'Extraits vidéo de concerts (chorales amies, en attendant nos propres captations).', null,
   null, 2, true, 'videos');

-- Photos — album Concert
insert into gallery_photos (album_id, url, caption, order_index) values
  ((select id from gallery_albums where title = 'Niveau Supérieur — le concert'), '/images/gallery/g-concert-1.webp', 'Sur scène, concentration avant d''attaquer', 0),
  ((select id from gallery_albums where title = 'Niveau Supérieur — le concert'), '/images/gallery/g-concert-2.webp', 'Les couleurs du plateau lumière', 1),
  ((select id from gallery_albums where title = 'Niveau Supérieur — le concert'), '/images/gallery/g-concert-3.webp', 'Le public a répondu présent', 2);

-- Photos — album Répétitions
insert into gallery_photos (album_id, url, caption, order_index) values
  ((select id from gallery_albums where title = 'Coulisses & répétitions'), '/images/gallery/g-repet-1.webp', 'Entre deux morceaux, on rigole aussi', 0),
  ((select id from gallery_albums where title = 'Coulisses & répétitions'), '/images/gallery/g-repet-2.webp', 'Répétition studieuse', 1);

-- Vidéos (vraies vidéos publiques de chorales amies, en licence libre d'usage YouTube)
insert into gallery_videos (album_id, youtube_id, title, thumbnail_url, order_index) values
  ((select id from gallery_albums where title = 'Vidéos'), 'zwXG9QgGkE8', 'Community Chorus Fall Concert', 'https://i.ytimg.com/vi/zwXG9QgGkE8/hqdefault.jpg', 0),
  ((select id from gallery_albums where title = 'Vidéos'), 'M4iOLoahDIE', 'Community Chorus — Scenes of Sea & Sky', 'https://i.ytimg.com/vi/M4iOLoahDIE/hqdefault.jpg', 1),
  ((select id from gallery_albums where title = 'Vidéos'), 'eW71dCS2oc4', 'Community Orchestra Concert — MAGFest 2024', 'https://i.ytimg.com/vi/eW71dCS2oc4/hqdefault.jpg', 2);
