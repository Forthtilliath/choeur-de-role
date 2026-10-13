-- Verrouillage d'un compte pendant 5 minutes après 3 tentatives de connexion.
-- Accès réservé au service_role (routes API) : RLS sans policy + droits retirés.
create table login_attempts (
  email        text        primary key,
  attempts     int         not null default 0,
  locked_until timestamptz,
  updated_at   timestamptz not null default now()
);

alter table login_attempts enable row level security;
revoke all on login_attempts from anon, authenticated;

-- Enregistre une tentative et renvoie la fin du verrou si le compte est bloqué
-- (null = tentative autorisée). Le verrou de ligne sérialise les requêtes
-- parallèles : impossible de dépasser 3 essais en les lançant simultanément.
create or replace function register_login_attempt(p_email text)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row login_attempts%rowtype;
  v_attempts int;
begin
  -- Ménage des entrées anciennes (emails inexistants, tentatives oubliées)
  delete from login_attempts where updated_at < now() - interval '1 day';

  insert into login_attempts (email) values (p_email) on conflict (email) do nothing;
  select * into v_row from login_attempts where email = p_email for update;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    return v_row.locked_until;
  end if;

  -- Verrou expiré ou dernière tentative ancienne : le compteur repart de zéro
  v_attempts := case
    when v_row.locked_until is not null or v_row.updated_at < now() - interval '5 minutes' then 1
    else v_row.attempts + 1
  end;

  update login_attempts
     set attempts     = v_attempts,
         locked_until = case when v_attempts >= 3 then now() + interval '5 minutes' end,
         updated_at   = now()
   where email = p_email;

  return null;
end;
$$;

-- Appelée après un mot de passe correct : remet le compteur à zéro
create or replace function clear_login_attempts(p_email text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from login_attempts where email = p_email;
$$;

revoke execute on function register_login_attempt(text) from public, anon, authenticated;
revoke execute on function clear_login_attempts(text) from public, anon, authenticated;
grant execute on function register_login_attempt(text) to service_role;
grant execute on function clear_login_attempts(text) to service_role;
