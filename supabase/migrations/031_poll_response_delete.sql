-- Permet à un membre de supprimer sa propre réponse (pour modifier son vote)
create policy "poll_responses: delete own"
  on poll_responses for delete to authenticated
  using (member_id = auth.uid());
