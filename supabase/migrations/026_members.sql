-- Ajouter la colonne de visibilité anniversaire
alter table members add column if not exists 
  visibility_birthday text not null default 'none'
  check (visibility_birthday in ('none', 'date_only', 'date_and_age'));

insert into event_types (label, color, is_special, order_index)
values ('Anniversaire', '#f97316', false, 999)
on conflict do nothing;