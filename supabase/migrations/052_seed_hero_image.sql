-- Image de fond de la hero section (page d'accueil) — distincte de la photo de groupe (page login)
insert into content_blocks (page, block_key, content) values
  ('home', 'hero_image', '/images/hero-spectacle.webp')
on conflict (page, block_key) do update set content = excluded.content;
