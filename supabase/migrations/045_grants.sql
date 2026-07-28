-- Grant schema and table access to PostgREST roles (local dev only needs this
-- because hosted Supabase applies these grants automatically on table creation).
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  grant all on tables to anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  grant all on routines to anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  grant all on sequences to anon, authenticated, service_role;
