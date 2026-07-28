insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

create policy "Documents readable by all"
  on storage.objects for select
  using (bucket_id = 'documents');

create policy "Admins can manage documents"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and get_my_role() in ('admin', 'super_admin')
  );

create policy "Admins can delete documents"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and get_my_role() in ('admin', 'super_admin')
  );

  insert into content_blocks (page, block_key, content)
values ('partners', 'sponsor_dossier_url', '')
on conflict (page, block_key) do nothing;