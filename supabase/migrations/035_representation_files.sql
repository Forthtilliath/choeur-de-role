-- Documents attachés à une représentation (paroles globales, programmes, etc.)

create table public.representation_files (
  id             uuid not null default gen_random_uuid(),
  performance_id uuid not null references public.performances(id) on delete cascade,
  label          text not null,
  file_url       text not null,
  order_index    integer default 0,
  created_at     timestamp with time zone default now(),
  constraint representation_files_pkey primary key (id)
);

alter table representation_files enable row level security;

create policy "Representation files readable by authenticated"
  on representation_files for select
  to authenticated
  using (true);

create policy "Admins can manage representation files"
  on representation_files for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));
