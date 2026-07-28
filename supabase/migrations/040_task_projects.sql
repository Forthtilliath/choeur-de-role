-- Task projects (one board per project/event)
CREATE TABLE task_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task templates (reusable task lists)
CREATE TABLE task_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items inside a template
CREATE TABLE task_template_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('on_hold', 'todo', 'in_progress', 'done')),
  position FLOAT NOT NULL DEFAULT 0
);

-- Attach tasks to a project
ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES task_projects(id) ON DELETE CASCADE;

-- Default project for existing tasks
INSERT INTO task_projects (name, description, is_active)
VALUES ('Général', 'Projet par défaut', true);

UPDATE tasks
SET project_id = (SELECT id FROM task_projects WHERE name = 'Général' LIMIT 1)
WHERE project_id IS NULL;

ALTER TABLE tasks ALTER COLUMN project_id SET NOT NULL;

-- RLS — task_projects
ALTER TABLE task_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ca_task_projects_select" ON task_projects FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "admin_task_projects_insert" ON task_projects FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "admin_task_projects_update" ON task_projects FOR UPDATE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "admin_task_projects_delete" ON task_projects FOR DELETE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- RLS — task_templates
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ca_task_templates_select" ON task_templates FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "admin_task_templates_insert" ON task_templates FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "admin_task_templates_update" ON task_templates FOR UPDATE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "admin_task_templates_delete" ON task_templates FOR DELETE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- RLS — task_template_items (admin only for writes, ca for reads)
ALTER TABLE task_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ca_task_template_items_select" ON task_template_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('ca', 'admin', 'super_admin')));
CREATE POLICY "admin_task_template_items_insert" ON task_template_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "admin_task_template_items_update" ON task_template_items FOR UPDATE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "admin_task_template_items_delete" ON task_template_items FOR DELETE
  USING (EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- updated_at trigger for task_projects
CREATE OR REPLACE FUNCTION update_task_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_projects_updated_at
  BEFORE UPDATE ON task_projects
  FOR EACH ROW EXECUTE FUNCTION update_task_projects_updated_at();
