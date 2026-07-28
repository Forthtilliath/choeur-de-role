-- Ajout d'une date de publication programmée sur les actualités
-- NULL = publication immédiate dès que published = true
-- Une valeur future = visible uniquement après cette date (et si published = true)
ALTER TABLE news ADD COLUMN scheduled_at timestamptz;
