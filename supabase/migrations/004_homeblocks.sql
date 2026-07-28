create table if not exists home_blocks (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  image_url text,
  order_index integer default 0,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table home_blocks enable row level security;

create policy "Home blocks readable by all"
  on home_blocks for select
  using (active = true);

create policy "Admins can manage home blocks"
  on home_blocks for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

-- Migrer les blocs existants
insert into home_blocks (content, order_index)
select content, row_number() over () - 1
from content_blocks
where page = 'home' and block_key in ('histoire', 'raison_etre', 'amelie');

insert into storage.buckets (id, name, public)
values ('home', 'home', true)
on conflict (id) do nothing;

create policy "Home images readable by all"
  on storage.objects for select
  using (bucket_id = 'home');

create policy "Admins can manage home images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'home'
    and get_my_role() in ('admin', 'super_admin')
  );

create policy "Admins can delete home images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'home'
    and get_my_role() in ('admin', 'super_admin')
  );

-- Ajouter le ratio d'image et le flag "nous rejoindre"
alter table home_blocks add column if not exists image_ratio text check (image_ratio in ('4/3', '3/4')) default '4/3';
alter table home_blocks add column if not exists is_join_section boolean default false;

-- Ajouter home_blocks dans database.types via régénération
-- (tu devras régénérer le fichier database.types.ts après)

insert into home_blocks (content, order_index, active, is_join_section)
values (
  '<h2>Nous rejoindre</h2><p>Vous souhaitez nous rejoindre ? Les répétitions ont lieu le <strong>mardi soir</strong> de <strong>20h30 à 22h00</strong> dans une salle municipale du centre-ville d''Angers.</p><p>N''hésitez pas à venir nous rencontrer lors d''une répétition ou à nous contacter pour plus d''informations !</p>',
  9999,
  true,
  true
)
on conflict do nothing;