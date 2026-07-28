alter table members add column if not exists lat double precision;
alter table members add column if not exists lng double precision;

insert into content_blocks (page, block_key, content) values
  ('carte', 'center_lat', '47.4706'),
  ('carte', 'center_lng', '-0.5566'),
  ('carte', 'center_label', 'Angers')
on conflict (page, block_key) do nothing;