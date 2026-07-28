create table if not exists ca_meetings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  meeting_date date not null,
  content text not null,
  published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table ca_meetings enable row level security;

create policy "CA meetings readable by ca and above"
  on ca_meetings for select
  to authenticated
  using (
    published = true
    and get_my_role() in ('ca', 'admin', 'super_admin')
  );

create policy "Admins can manage ca meetings"
  on ca_meetings for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

create table if not exists ca_meetings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  meeting_date date not null,
  content text not null,
  published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table ca_meetings enable row level security;

drop policy if exists "CA meetings readable by ca and above" on ca_meetings;

create policy "CA meetings readable by authenticated"
  on ca_meetings for select
  to authenticated
  using (published = true);