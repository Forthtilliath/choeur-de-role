create table if not exists member_links (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  url text not null,
  description text,
  order_index integer default 0,
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table member_links enable row level security;

create policy "Links readable by authenticated"
  on member_links for select
  to authenticated
  using (active = true);

create policy "Admins can manage links"
  on member_links for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));