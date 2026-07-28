-- Add duration fields to tasks and task_template_items
ALTER TABLE tasks
  ADD COLUMN duration_value INT CHECK (duration_value > 0),
  ADD COLUMN duration_unit TEXT CHECK (duration_unit IN ('minutes', 'hours', 'days', 'weeks'));

ALTER TABLE task_template_items
  ADD COLUMN duration_value INT CHECK (duration_value > 0),
  ADD COLUMN duration_unit TEXT CHECK (duration_unit IN ('minutes', 'hours', 'days', 'weeks'));
