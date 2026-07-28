alter table members add column if not exists onboarded_at timestamp with time zone;
alter table members add column if not exists admin_onboarded_at timestamp with time zone;
