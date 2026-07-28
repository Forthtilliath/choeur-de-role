-- Pièces jointes des actualités

create table public.news_files (
  id          uuid not null default gen_random_uuid(),
  news_id     uuid not null references public.news(id) on delete cascade,
  label       text not null,
  file_url    text not null,
  order_index integer default 0,
  created_at  timestamp with time zone default now(),
  constraint news_files_pkey primary key (id)
);

alter table news_files enable row level security;

create policy "News files readable by authenticated"
  on news_files for select
  to authenticated
  using (true);

create policy "Admins can manage news files"
  on news_files for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));
