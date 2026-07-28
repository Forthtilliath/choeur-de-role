-- Table dates
create table public.external_event_dates (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references public.external_events(id) on delete cascade,
  date timestamp with time zone not null,
  constraint external_event_dates_pkey primary key (id)
);

alter table external_event_dates enable row level security;
create policy "External event dates readable by all" on external_event_dates for select using (true);
create policy "Admins can manage external event dates" on external_event_dates for all to authenticated using (get_my_role() in ('admin', 'super_admin'));

-- Table fichiers
create table public.external_event_files (
  id uuid not null default gen_random_uuid(),
  event_id uuid not null references public.external_events(id) on delete cascade,
  label text not null,
  file_url text not null,
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  constraint external_event_files_pkey primary key (id)
);

alter table external_event_files enable row level security;
create policy "External event files readable by all" on external_event_files for select using (true);
create policy "Admins can manage external event files" on external_event_files for all to authenticated using (get_my_role() in ('admin', 'super_admin'));

-- Migrer les dates existantes
insert into external_event_dates (event_id, date)
select id, date::timestamp with time zone from external_events where date is not null;

-- Nettoyer
alter table external_events drop column if exists date;
alter table external_events drop column if exists ticket_url;