alter table performances add column if not exists external_url text;
alter table performances add column if not exists slug text unique;

-- Générer les slugs pour les performances existantes
update performances
set slug = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(title, '[àâä]', 'a', 'g'),
      '[éèêë]', 'e', 'g'
    ),
    '[^a-z0-9]+', '-', 'g'
  )
) || '-' || substring(id::text, 1, 8)
where slug is null;

create or replace function generate_performance_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter int := 0;
begin
  -- Générer le slug de base depuis le titre
  base_slug := lower(new.title);
  base_slug := regexp_replace(base_slug, '[àâä]', 'a', 'g');
  base_slug := regexp_replace(base_slug, '[éèêë]', 'e', 'g');
  base_slug := regexp_replace(base_slug, '[îï]', 'i', 'g');
  base_slug := regexp_replace(base_slug, '[ôö]', 'o', 'g');
  base_slug := regexp_replace(base_slug, '[ùûü]', 'u', 'g');
  base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Vérifier l'unicité et ajouter un suffixe si besoin
  while exists (
    select 1 from performances
    where slug = final_slug
    and id != new.id
  ) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;

  new.slug := final_slug;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_performance_slug on performances;

create trigger set_performance_slug
  before insert or update of title
  on performances
  for each row
  execute function generate_performance_slug();