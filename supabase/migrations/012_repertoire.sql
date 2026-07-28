-- Fichiers liés aux chants
create table if not exists song_files (
  id uuid default gen_random_uuid() primary key,
  song_id uuid references songs(id) on delete cascade not null,
  type text check (type in ('audio', 'score', 'lyrics')) not null,
  file_url text not null,
  label text, -- ex: "Version Amélie", "Partition complète", "Paroles version 2"
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Liaison fichier <-> pupitres (un fichier peut concerner plusieurs pupitres)
create table if not exists song_file_voice_part (
  id uuid default gen_random_uuid() primary key,
  song_file_id uuid references song_files(id) on delete cascade not null,
  voice_part_id uuid references voice_parts(id) on delete cascade not null,
  unique(song_file_id, voice_part_id)
);

-- RLS
alter table song_files enable row level security;
alter table song_file_voice_part enable row level security;

create policy "Song files readable by authenticated"
  on song_files for select
  to authenticated
  using (true);

create policy "Admins can manage song files"
  on song_files for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

create policy "Song file voice part readable by authenticated"
  on song_file_voice_part for select
  to authenticated
  using (true);

create policy "Admins can manage song file voice parts"
  on song_file_voice_part for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- Bucket storage pour les fichiers du répertoire
insert into storage.buckets (id, name, public)
values ('repertoire', 'repertoire', false)
on conflict (id) do nothing;

-- Seuls les connectés peuvent lire les fichiers
create policy "Authenticated can read repertoire files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'repertoire');

create policy "Admins can manage repertoire files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'repertoire'
    and get_my_role() in ('admin', 'super_admin')
  );

create policy "Admins can delete repertoire files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'repertoire'
    and get_my_role() in ('admin', 'super_admin')
  );

-- Label sur les chants
alter table songs add column if not exists label text;

-- Remettre le bucket en privé
update storage.buckets set public = false where id = 'repertoire';

alter table voice_parts add column if not exists group_name text;

-- Exemples de groupes
update voice_parts set group_name = 'Sopranes' where name in ('Soprano 1', 'Soprano 2', 'Soprano');
update voice_parts set group_name = 'Hommes' where name in ('Ténor', 'Basse', 'Ténors', 'Basses');
update voice_parts set group_name = 'Alti' where name in ('Alto 1', 'Alto 2', 'Alto');

alter table songs drop column if exists type;
alter table songs drop column if exists file_url;

alter table voice_parts add column if not exists order_index integer default 0;