insert into content_blocks (page, block_key, content) values
  ('legal', 'association_name', 'Chœur de Rôle'),
  ('legal', 'siege_social', 'Maison des Associations, 49000 Angers'),
  ('legal', 'rna', 'W493009876'),
  ('legal', 'president_name', 'Thomas MERCIER'),
  ('legal', 'contact_email', 'contact@choeur-de-role.fr'),
  ('legal', 'hebergeur_name', 'Vercel Inc.'),
  ('legal', 'hebergeur_address', '340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis'),
  ('legal', 'hebergeur_url', 'https://vercel.com'),
  ('legal', 'site_url', 'choeur-de-role.fr')
on conflict (page, block_key) do nothing;