create table public.event_types (
  id uuid not null default gen_random_uuid(),
  label text not null,
  color text not null default '#22c55e',
  is_special boolean not null default false,
  order_index integer not null default 0,
  constraint event_types_pkey primary key (id)
);

create table public.calendar_events (
  id uuid not null default gen_random_uuid(),
  title text not null,
  event_type_id uuid not null references event_types(id) on delete restrict,
  starts_at timestamp with time zone not null,
  ends_at timestamp with time zone not null,
  location text null,
  description text null,
  created_at timestamp with time zone default now(),
  constraint calendar_events_pkey primary key (id)
);

insert into event_types (label, color, is_special, order_index) values
  ('Répétition', '#22c55e', false, 0),
  ('Répétition spéciale', '#f97316', true, 1),
  ('Concert', '#8b5cf6', true, 2),
  ('Autre', '#64748b', false, 3);

  -- event_types : lecture pour tous les connectés, écriture admin seulement
create policy "Lecture event_types pour choristes"
on event_types for select
to authenticated
using (true);

create policy "Ecriture event_types pour admins"
on event_types for all
to authenticated
using (
  exists (
    select 1 from members
    where members.id = auth.uid()
    and members.role in ('admin', 'super_admin')
  )
);

-- calendar_events : même logique
create policy "Lecture calendar_events pour choristes"
on calendar_events for select
to authenticated
using (true);

create policy "Ecriture calendar_events pour admins"
on calendar_events for all
to authenticated
using (
  exists (
    select 1 from members
    where members.id = auth.uid()
    and members.role in ('admin', 'super_admin')
  )
);