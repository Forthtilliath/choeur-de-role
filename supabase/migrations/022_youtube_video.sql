alter table gallery_albums
  add column if not exists youtube_playlist_url text;

alter table gallery_albums
  add column if not exists album_type text
  default 'photos'
  check (album_type in ('photos', 'videos', 'mixed'));

create table if not exists gallery_videos (
  id uuid not null default gen_random_uuid(),
  album_id uuid not null references gallery_albums(id) on delete cascade,
  youtube_id text not null,
  title text,
  thumbnail_url text,
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  constraint gallery_videos_pkey primary key (id)
);

-- Activer RLS
alter table gallery_videos enable row level security;

-- Lecture publique (comme gallery_photos)
create policy "Gallery videos readable by all"
  on gallery_videos for select
  using (true);

-- Écriture admin uniquement
create policy "Admins can manage gallery videos"
  on gallery_videos for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));