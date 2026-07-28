create table audit_logs (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete set null,
  action     text        not null,
  target_id  text,
  details    jsonb,
  ip         text,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;

create policy "Admins can read audit logs"
  on audit_logs for select
  using (get_my_role() in ('admin', 'super_admin'));

create index audit_logs_created_at_idx on audit_logs (created_at desc);
create index audit_logs_user_id_idx    on audit_logs (user_id);
