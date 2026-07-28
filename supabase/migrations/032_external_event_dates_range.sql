-- Ajoute une date de fin optionnelle par occurrence
-- Cas d'usage : stage multi-jours, créneau horaire (10h-18h)
alter table external_event_dates
  add column end_date timestamp with time zone null;
