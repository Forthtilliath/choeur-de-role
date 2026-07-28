-- Task categories (admin-managed labels to group tasks)
CREATE TABLE task_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  position FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE task_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ca_task_categories_select" ON task_categories FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "admin_task_categories_insert" ON task_categories FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "admin_task_categories_update" ON task_categories FOR UPDATE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "admin_task_categories_delete" ON task_categories FOR DELETE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Add category_id to tasks and template_items
ALTER TABLE tasks
  ADD COLUMN category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL;

ALTER TABLE task_template_items
  ADD COLUMN category_id UUID REFERENCES task_categories(id) ON DELETE SET NULL;
