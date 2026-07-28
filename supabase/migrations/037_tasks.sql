-- Bureau task management
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  position FLOAT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_assignees (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, member_id)
);

CREATE TABLE task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES members(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ca_tasks_select" ON tasks FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "ca_tasks_insert" ON tasks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "ca_tasks_update" ON tasks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "ca_tasks_delete" ON tasks FOR DELETE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));

CREATE POLICY "ca_task_assignees_select" ON task_assignees FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "ca_task_assignees_insert" ON task_assignees FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "ca_task_assignees_delete" ON task_assignees FOR DELETE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));

CREATE POLICY "ca_task_comments_select" ON task_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "ca_task_comments_insert" ON task_comments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "ca_task_comments_delete" ON task_comments FOR DELETE
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_tasks_updated_at();
