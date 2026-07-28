-- Albums
create table if not exists gallery_albums (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  cover_url text,
  performance_id uuid references performances(id) on delete set null,
  order_index integer default 0,
  published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Photos
create table if not exists gallery_photos (
  id uuid default gen_random_uuid() primary key,
  album_id uuid references gallery_albums(id) on delete cascade,
  url text not null,
  caption text,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

-- RLS
alter table gallery_albums enable row level security;
alter table gallery_photos enable row level security;

-- Policies albums
create policy "Published albums readable by all"
  on gallery_albums for select
  using (published = true);

create policy "Admins can manage albums"
  on gallery_albums for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- Policies photos
create policy "Photos readable by all"
  on gallery_photos for select
  using (
    exists (
      select 1 from gallery_albums
      where gallery_albums.id = gallery_photos.album_id
      and gallery_albums.published = true
    )
  );

create policy "Admins can manage photos"
  on gallery_photos for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Gallery images readable by all"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Admins can upload gallery images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and get_my_role() in ('admin', 'super_admin')
  );

create policy "Admins can delete gallery images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and get_my_role() in ('admin', 'super_admin')
  );