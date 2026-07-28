-- Restrict task deletion to creator or admin/super_admin
DROP POLICY IF EXISTS "ca_tasks_delete" ON tasks;

CREATE POLICY "ca_tasks_delete" ON tasks FOR DELETE
  USING (
    (
      auth.uid() = created_by
      AND EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin'))
    )
    OR EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
