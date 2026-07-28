-- Ajoute le slug pour des URLs lisibles sur les évènements externes
alter table external_events add column if not exists slug text unique;

-- Générer les slugs pour les évènements existants
update external_events
set slug = lower(
  trim(both '-' from
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(lower(title),
                '[àâäáã]', 'a', 'g'),
              '[éèêë]', 'e', 'g'),
            '[îï]', 'i', 'g'),
          '[ôö]', 'o', 'g'),
        '[ùûü]', 'u', 'g'),
      '[^a-z0-9]+', '-', 'g')
  )
) || '-' || substring(id::text, 1, 8)
where slug is null;

create or replace function generate_external_event_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter int := 0;
begin
  base_slug := lower(new.title);
  base_slug := regexp_replace(base_slug, '[àâäáã]', 'a', 'g');
  base_slug := regexp_replace(base_slug, '[éèêë]', 'e', 'g');
  base_slug := regexp_replace(base_slug, '[îï]', 'i', 'g');
  base_slug := regexp_replace(base_slug, '[ôö]', 'o', 'g');
  base_slug := regexp_replace(base_slug, '[ùûü]', 'u', 'g');
  base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  while exists (
    select 1 from external_events
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

drop trigger if exists set_external_event_slug on external_events;

create trigger set_external_event_slug
  before insert or update of title
  on external_events
  for each row
  execute function generate_external_event_slug();
