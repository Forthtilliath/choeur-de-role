create or replace view members_public as
select
  id,
  first_name,
  last_name,
  voice_part_id,
  role,
  bureau_role,
  photo_url,
  -- Email seulement si visibility_email = true
  case when visibility_email = true then email else null end as email,
  -- Téléphone seulement si visibility_phone = true
  case when visibility_phone = true then phone else null end as phone,
  -- Adresse seulement si visibility_address = true
  case when visibility_address = true then address else null end as address,
  case when visibility_address = true then zip_code else null end as zip_code,
  case when visibility_address = true then city else null end as city,
  -- Les flags de visibilité restent visibles (pour l'affichage du profil perso)
  visibility_email,
  visibility_phone,
  visibility_address,
  updated_at,
  self_updated_at
from members;

-- RLS sur la vue
alter view members_public set (security_invoker = true);

create policy "Members can read public view"
  on members for select
  to authenticated
  using (true);

drop view if exists members_public;

alter table performances drop constraint performances_season_id_fkey;
alter table performances add constraint performances_season_id_fkey
  foreign key (season_id) references seasons(id) on delete set null;