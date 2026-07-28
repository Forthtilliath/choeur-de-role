-- Add 'on_hold' status for tasks blocked by unresolved dependencies
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check
  CHECK (status IN ('on_hold', 'todo', 'in_progress', 'done'));
