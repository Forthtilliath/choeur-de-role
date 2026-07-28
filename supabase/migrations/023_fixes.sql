-- Lecture pour tous les authentifiés
create policy "Voice parts readable by authenticated"
  on voice_parts for select
  to authenticated
  using (true);

-- Gestion par les admins uniquement
create policy "Admins can manage voice parts"
  on voice_parts for all
  to authenticated
  using (get_my_role() in ('admin', 'super_admin'));

alter table ca_meetings add column if not exists pdf_url text;