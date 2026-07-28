-- Dernière connexion
alter table members add column if not exists last_login_at timestamp with time zone;

-- Section éditable en haut des actualités
insert into content_blocks (page, block_key, content)
values ('actualites', 'intro', '<p>Bienvenue dans l''espace choristes !</p>')
on conflict (page, block_key) do nothing;