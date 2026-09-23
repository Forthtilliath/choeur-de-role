export type TaskStatus = 'on_hold' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type DurationUnit = 'minutes' | 'hours' | 'days' | 'weeks';

export type TaskCategory = {
  id: string;
  name: string;
  color: string;
  position: number;
};

export type TaskAssignee = {
  member_id: string;
  first_name: string | null;
  last_name: string | null;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_id: string | null;
  author_name: string | null;
  content: string;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  duration_value: number | null;
  duration_unit: DurationUnit | null;
  category_id: string | null;
  category: TaskCategory | null;
  position: number;
  project_id: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  assignees: TaskAssignee[];
};

export type CaMember = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export type TaskProject = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  task_count: number;
};

export type TaskTemplate = {
  id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string | null;
  item_count: number;
};

export type TaskTemplateItem = {
  id: string;
  template_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  duration_value: number | null;
  duration_unit: DurationUnit | null;
  category_id: string | null;
  category: TaskCategory | null;
  position: number;
};
