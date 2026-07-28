-- =============================================
-- SCHEMA SQL — CHOEUR DE ROLE
-- =============================================
-- À exécuter dans l'ordre dans le SQL Editor Supabase
-- =============================================

-- =====================
-- EXTENSIONS
-- =====================
create extension if not exists "uuid-ossp";

-- =====================
-- VOICE PARTS
-- =====================
create table if not exists voice_parts (
  id uuid default gen_random_uuid() primary key,
  name text not null check (name in ('soprano', 'alto', 'tenor', 'bass')),
  created_at timestamp with time zone default now()
);

insert into voice_parts (name)
select name from (values ('soprano'), ('alto'), ('tenor'), ('bass')) as v(name)
where not exists (select 1 from voice_parts where voice_parts.name = v.name);

-- =====================
-- SEASONS
-- =====================
create table if not exists seasons (
  id uuid default gen_random_uuid() primary key,
  label text not null unique,
  active boolean default false,
  created_at timestamp with time zone default now()
);

-- =====================
-- MEMBERS
-- =====================
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  first_name text,
  last_name text,
  voice_part_id uuid references voice_parts(id),
  role text check (role in ('member', 'ca', 'admin', 'super_admin')) default 'member',
  phone text,
  address text,
  zip_code text,
  city text,
  birthday date,
  visibility_email boolean default false,
  visibility_phone boolean default false,
  visibility_address boolean default false,
  activated boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================
-- MEMBER <-> SEASON
-- =====================
create table if not exists member_season (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references members(id) on delete cascade,
  season_id uuid references seasons(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(member_id, season_id)
);

-- =====================
-- PERFORMANCES
-- =====================
create table if not exists performances (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  season_id uuid references seasons(id),
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================
-- PERFORMANCE DATES
-- =====================
create table if not exists performance_dates (
  id uuid default gen_random_uuid() primary key,
  performance_id uuid references performances(id) on delete cascade,
  date timestamp with time zone not null,
  venue text,
  created_at timestamp with time zone default now()
);

-- =====================
-- SONGS
-- =====================
create table if not exists songs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  composer text,
  type text check (type in ('audio', 'score', 'lyrics')),
  file_url text,
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================
-- SONG <-> VOICE PART
-- =====================
create table if not exists song_voice_part (
  id uuid default gen_random_uuid() primary key,
  song_id uuid references songs(id) on delete cascade,
  voice_part_id uuid references voice_parts(id) on delete cascade,
  unique(song_id, voice_part_id)
);

-- =====================
-- SONG <-> PERFORMANCE
-- =====================
create table if not exists song_performance (
  id uuid default gen_random_uuid() primary key,
  song_id uuid references songs(id) on delete cascade,
  performance_id uuid references performances(id) on delete cascade,
  unique(song_id, performance_id)
);

-- =====================
-- PARTNERS
-- =====================
create table if not exists partners (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  logo_url text not null,
  website_url text,
  order_index integer default 0,
  size text check (size in ('current_large', 'current_square', 'past_large', 'past_square')) default 'current_large',
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =====================
-- CONTENT BLOCKS
-- =====================
create table if not exists content_blocks (
  id uuid default gen_random_uuid() primary key,
  page text not null,
  block_key text not null,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(page, block_key)
);

-- =====================
-- CONTACT MESSAGES
-- =====================
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  category text check (category in ('rejoindre', 'partenariat', 'autre')) not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- =====================
-- TRIGGER : création automatique d'un member quand un user est créé dans auth
-- =====================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.members (id, email)
  values (new.id, new.email)
  on conflict (email) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- FONCTION : get_my_role (évite la récursion infinie dans les policies)
-- =====================
create or replace function get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from members where id = auth.uid();
$$;

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table voice_parts enable row level security;
alter table seasons enable row level security;
alter table members enable row level security;
alter table member_season enable row level security;
alter table performances enable row level security;
alter table performance_dates enable row level security;
alter table songs enable row level security;
alter table song_voice_part enable row level security;
alter table song_performance enable row level security;
alter table partners enable row level security;
alter table content_blocks enable row level security;
alter table contact_messages enable row level security;

-- =====================
-- DROP EXISTING POLICIES
-- =====================
drop policy if exists "Voice parts readable by all" on voice_parts;
drop policy if exists "Performances readable by all" on performances;
drop policy if exists "Performance dates readable by all" on performance_dates;
drop policy if exists "Seasons readable by authenticated" on seasons;
drop policy if exists "Members select policy" on members;
drop policy if exists "Members can update own profile" on members;
drop policy if exists "Admins can insert members" on members;
drop policy if exists "Admins can update members" on members;
drop policy if exists "Super admin full access" on members;
drop policy if exists "Member season readable by authenticated" on member_season;
drop policy if exists "Admins can manage member seasons" on member_season;
drop policy if exists "Songs readable by authenticated" on songs;
drop policy if exists "Admins can manage songs" on songs;
drop policy if exists "Song voice part readable by authenticated" on song_voice_part;
drop policy if exists "Admins can manage song voice parts" on song_voice_part;
drop policy if exists "Song performance readable by authenticated" on song_performance;
drop policy if exists "Admins can manage song performances" on song_performance;
drop policy if exists "Admins can manage performances" on performances;
drop policy if exists "Admins can manage performance dates" on performance_dates;
drop policy if exists "Admins can manage seasons" on seasons;
drop policy if exists "Partners readable by all" on partners;
drop policy if exists "Admins can manage partners" on partners;
drop policy if exists "Content blocks readable by all" on content_blocks;
drop policy if exists "Admins can manage content blocks" on content_blocks;
drop policy if exists "Anyone can insert contact messages" on contact_messages;
drop policy if exists "Admins can read contact messages" on contact_messages;
drop policy if exists "Admins can update contact messages" on contact_messages;

-- =====================
-- POLICIES VOICE PARTS
-- =====================
create policy "Voice parts readable by all"
  on voice_parts for select
  using (true);

-- =====================
-- POLICIES PERFORMANCES
-- =====================
create policy "Performances readable by all"
  on performances for select
  using (true);

create policy "Admins can manage performances"
  on performances for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES PERFORMANCE DATES
-- =====================
create policy "Performance dates readable by all"
  on performance_dates for select
  using (true);

create policy "Admins can manage performance dates"
  on performance_dates for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES SEASONS
-- =====================
create policy "Seasons readable by authenticated"
  on seasons for select
  to authenticated
  using (true);

create policy "Admins can manage seasons"
  on seasons for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES MEMBERS
-- =====================
create policy "Members select policy"
  on members for select
  to authenticated
  using (
    auth.uid() = id
    or get_my_role() in ('ca', 'admin', 'super_admin')
    or (
      visibility_email = true
      or visibility_phone = true
      or visibility_address = true
    )
  );

create policy "Members can update own profile"
  on members for update
  to authenticated
  using (auth.uid() = id)
  with check (
    role = get_my_role()
  );

create policy "Admins can insert members"
  on members for insert
  to authenticated
  with check (
    get_my_role() in ('admin', 'super_admin')
  );

create policy "Admins can update members"
  on members for update
  to authenticated
  using (
    get_my_role() in ('admin', 'super_admin')
  )
  with check (
    role = get_my_role()
    or get_my_role() = 'super_admin'
  );

create policy "Super admin full access"
  on members for all
  to authenticated
  using (
    get_my_role() = 'super_admin'
  );

-- =====================
-- POLICIES MEMBER_SEASON
-- =====================
create policy "Member season readable by authenticated"
  on member_season for select
  to authenticated
  using (true);

create policy "Admins can manage member seasons"
  on member_season for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES SONGS
-- =====================
create policy "Songs readable by authenticated"
  on songs for select
  to authenticated
  using (true);

create policy "Admins can manage songs"
  on songs for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES SONG_VOICE_PART
-- =====================
create policy "Song voice part readable by authenticated"
  on song_voice_part for select
  to authenticated
  using (true);

create policy "Admins can manage song voice parts"
  on song_voice_part for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES SONG_PERFORMANCE
-- =====================
create policy "Song performance readable by authenticated"
  on song_performance for select
  to authenticated
  using (true);

create policy "Admins can manage song performances"
  on song_performance for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES PARTNERS
-- =====================
create policy "Partners readable by all"
  on partners for select
  using (active = true);

create policy "Admins can manage partners"
  on partners for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES CONTENT BLOCKS
-- =====================
create policy "Content blocks readable by all"
  on content_blocks for select
  using (true);

create policy "Admins can manage content blocks"
  on content_blocks for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- =====================
-- POLICIES CONTACT MESSAGES
-- =====================
create policy "Anyone can insert contact messages"
  on contact_messages for insert
  with check (true);

create policy "Admins can read contact messages"
  on contact_messages for select
  to authenticated
  using (get_my_role() in ('ca', 'admin', 'super_admin'));

create policy "Admins can update contact messages"
  on contact_messages for update
  to authenticated
  using (get_my_role() in ('ca', 'admin', 'super_admin'));

-- =====================
-- STORAGE BUCKET PARTNERS
-- =====================
insert into storage.buckets (id, name, public)
values ('partners', 'partners', true)
on conflict (id) do nothing;

create policy "Admins can upload partner images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'partners'
    and get_my_role() in ('admin', 'super_admin')
  );

create policy "Admins can update partner images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'partners'
    and get_my_role() in ('admin', 'super_admin')
  );

create policy "Admins can delete partner images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'partners'
    and get_my_role() in ('admin', 'super_admin')
  );

-- =====================
-- CONTENU INITIAL PAGE D'ACCUEIL
-- =====================
insert into content_blocks (page, block_key, content)
values
  ('home', 'hero_title', '<h1>Chœur de Rôle</h1>'),
  ('home', 'hero_subtitle', '<p>« Ici, on joue collectif — sur scène comme autour d''un plateau. »</p>'),
  ('home', 'histoire', '<h2>Notre histoire</h2><p>Tout commence en <strong>2015</strong>, autour d''une table de jeu. Une poignée de joueurs de jeux de société angevins, entre deux parties, se surprennent à chanter à tue-tête sur la playlist du groupe. La blague dure quelques semaines... puis devient une habitude, puis une vraie répétition.</p><p>Dès <strong>2016</strong>, le chœur s''ouvre à toutes les personnes intéressées par le chant, joueuses de plateau ou non — la partie continue, mais tout le monde peut désormais y participer.</p><p><em>Aujourd''hui, le <strong>Chœur de Rôle</strong> réunit <strong>près de 70 choristes adultes</strong>, avec la même envie qu''au premier jour : monter sur scène tous les 2 ans pour un spectacle vivant, comme on lance les dés — ensemble.</em></p>'),
  ('home', 'raison_etre', '<h2>Notre raison d''être</h2><p>Le <strong>Chœur de Rôle</strong> réunit des choristes de <strong>18 à 75 ans</strong>, débutants ou expérimentés, joueurs de plateau ou simples curieux — plusieurs générations autour d''une même passion : le chant choral, <strong>l''expression corporelle et les chorégraphies</strong>.</p><p>Comme dans un bon jeu de société, <strong>chacun a un rôle à jouer</strong> : basses, altos, ténors ou sopranes, personne ne porte la mélodie seul. Notre force, c''est de la porter ensemble.</p><p>La musique et les chants abordés lors de nos spectacles sont universels — de la variété française aux tubes internationaux — et font tomber les barrières entre les gens, avec humour et bienveillance.</p><p><em>Plus qu''une partie entre amis, chaque concert reste gravé comme une victoire collective.</em></p>'),
  ('home', 'amelie', '<h2>Direction artistique</h2><h3>Camille Vidal</h3><p>Avant de diriger un chœur, Camille dirigeait ses pions : championne régionale d''échecs junior à <strong>15 ans</strong>, elle passait plus de temps penchée sur un échiquier que sur une partition.</p><p>C''est un peu par hasard qu''elle rejoint une chorale universitaire, pour suivre une amie. Elle y retrouve, sans s''y attendre, les mêmes sensations que face à un adversaire : <strong>anticiper, écouter, ajuster sa stratégie à chaque mesure</strong> — sauf qu''ici, tout le monde joue dans le même camp.</p><p>Elle ne quittera plus jamais le pupitre. Aujourd''hui professeure de chant et coach vocal, elle dirige <strong>plusieurs chœurs de la région angevine</strong>, garde toujours un jeu de société à portée de main en répétition, et affirme sans rire que <strong>diriger un chœur et gagner une partie d''échecs</strong> demandent exactement la même qualité : savoir quand laisser les autres jouer leur coup.</p><p><em>« Une chorale, c''est une partie qu''on ne peut gagner qu''ensemble. »</em></p>'),
  ('home', 'rejoindre', '<h2>Nous rejoindre</h2><p>Vous souhaitez nous rejoindre ? Les répétitions ont lieu le <strong>mardi soir</strong> de <strong>20h30 à 22h00</strong> dans une salle municipale du centre-ville d''Angers.</p><p>N''hésitez pas à venir nous rencontrer lors d''une répétition ou à nous contacter pour plus d''informations !</p>')
on conflict (page, block_key) do nothing;