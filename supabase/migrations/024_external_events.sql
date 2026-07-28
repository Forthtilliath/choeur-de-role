create table public.external_events (
  id uuid not null default gen_random_uuid(),
  title text not null,
  date date not null,
  location text,
  image_url text,
  description text,
  ticket_url text,
  external_url text,
  published boolean default false,
  order_index integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint external_events_pkey primary key (id)
);

alter table external_events enable row level security;

create policy "External events readable by all"
  on external_events for select
  using (published = true);

create policy "Admins can manage external events"
  on external_events for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));