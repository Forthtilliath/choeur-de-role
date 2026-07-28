-- Photo et rôle bureau sur les membres
alter table members add column if not exists photo_url text;
alter table members add column if not exists bureau_role text;
alter table members add column if not exists updated_at timestamp with time zone default now();

-- Trigger pour mettre à jour updated_at automatiquement
create or replace function update_member_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_member_updated_at on members;
create trigger set_member_updated_at
  before update on members
  for each row
  execute function update_member_updated_at();

-- Bucket storage pour les photos membres
insert into storage.buckets (id, name, public)
values ('members', 'members', true)
on conflict (id) do nothing;

create policy "Member photos readable by all"
  on storage.objects for select
  using (bucket_id = 'members');

create policy "Members can upload their own photo"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'members');

create policy "Members can delete their own photo"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'members');

alter table members drop constraint if exists members_voice_part_id_fkey;
alter table members
  add constraint members_voice_part_id_fkey
  foreign key (voice_part_id)
  references voice_parts(id)
  on delete set null;

alter table voice_parts add column if not exists is_voice_part boolean default true;

-- Marquer tutti et instrumental comme non-pupitres
update voice_parts set is_voice_part = false where name in ('Tutti', 'Instrumentale');

alter table members add column if not exists self_updated_at timestamp with time zone;