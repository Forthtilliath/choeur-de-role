create table if not exists news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  published boolean default false,
  pinned boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table news enable row level security;

create policy "News readable by authenticated"
  on news for select
  to authenticated
  using (published = true);

create policy "Admins can manage news"
  on news for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));