-- Niveau de visibilité sur les liens
alter table member_links add column if not exists visibility text 
  check (visibility in ('member', 'ca', 'admin')) 
  default 'member';

-- Mettre à jour la RLS pour respecter la visibilité
drop policy if exists "Links readable by authenticated" on member_links;

create policy "Links readable by authenticated"
  on member_links for select
  to authenticated
  using (
    active = true and (
      visibility = 'member'
      or (visibility = 'ca' and get_my_role() in ('ca', 'admin', 'super_admin'))
      or (visibility = 'admin' and get_my_role() in ('admin', 'super_admin'))
    )
  );

-- Permettre aux CA de gérer les liens
-- drop policy if exists "Admins can manage links" on member_links;

-- create policy "CA can manage links"
--   on member_links for all
--   to authenticated
--   using (get_my_role() in ('ca', 'admin', 'super_admin'));