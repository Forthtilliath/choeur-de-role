import { createServerClient } from '@/lib/supabase.server';
import type { CaMember, Task, TaskCategory, TaskComment, TaskProject, TaskTemplate, TaskTemplateItem } from '@/types/tasks';

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<TaskCategory[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServerClient()) as any;
  const { data } = await supabase
    .from('task_categories')
    .select('id, name, color, position')
    .order('position', { ascending: true });
  return (data ?? []) as TaskCategory[];
}

export async function getTasks(projectId: string): Promise<Task[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServerClient()) as any;
  const { data } = await supabase
    .from('tasks')
    .select(`
      id, title, description, status, priority, due_date, duration_value, duration_unit,
      category_id, position, project_id, created_by, created_at, updated_at,
      task_assignees(member_id, members(first_name, last_name)),
      task_categories(id, name, color, position)
    `)
    .eq('project_id', projectId)
    .order('position', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description ?? null,
    status: t.status as Task['status'],
    priority: t.priority as Task['priority'],
    due_date: t.due_date ?? null,
    duration_value: t.duration_value ?? null,
    duration_unit: t.duration_unit ?? null,
    category_id: t.category_id ?? null,
    category: t.task_categories ?? null,
    position: t.position,
    project_id: t.project_id,
    created_by: t.created_by ?? null,
    created_at: t.created_at,
    updated_at: t.updated_at,
    assignees: ((t.task_assignees ?? []) as { member_id: string; members: { first_name: string | null; last_name: string | null } | null }[]).map((a) => ({
      member_id: a.member_id,
      first_name: a.members?.first_name ?? null,
      last_name: a.members?.last_name ?? null,
    })),
  }));
}

export async function getAllTaskComments(projectId: string): Promise<TaskComment[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServerClient()) as any;
  const { data } = await supabase
    .from('task_comments')
    .select('id, task_id, author_id, content, created_at, members(first_name, last_name), tasks!inner(project_id)')
    .eq('tasks.project_id', projectId)
    .order('created_at', { ascending: true });

  return ((data ?? []) as { id: string; task_id: string; author_id: string | null; content: string; created_at: string; members: { first_name: string | null; last_name: string | null } | null }[]).map((c) => ({
    id: c.id,
    task_id: c.task_id,
    author_id: c.author_id ?? null,
    author_name: c.members
      ? `${c.members.first_name ?? ''} ${c.members.last_name ?? ''}`.trim() || null
      : null,
    content: c.content,
    created_at: c.created_at,
  }));
}

export async function getCaMembers(): Promise<CaMember[]> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('members')
    .select('id, first_name, last_name')
    .in('role', ['ca', 'admin', 'super_admin'])
    .order('last_name');
  return (data ?? []).map((m) => ({
    id: m.id,
    first_name: m.first_name ?? null,
    last_name: m.last_name ?? null,
  }));
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<TaskProject[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServerClient()) as any;
  const { data } = await supabase
    .from('task_projects')
    .select('id, name, description, is_active, created_by, created_at, updated_at, tasks(count)')
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? null,
    is_active: p.is_active,
    created_by: p.created_by ?? null,
    created_at: p.created_at,
    updated_at: p.updated_at,
    task_count: p.tasks?.[0]?.count ?? 0,
  }));
}

export async function getProject(id: string): Promise<TaskProject | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServerClient()) as any;
  const { data } = await supabase
    .from('task_projects')
    .select('id, name, description, is_active, created_by, created_at, updated_at, tasks(count)')
    .eq('id', id)
    .single();

  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? null,
    is_active: data.is_active,
    created_by: data.created_by ?? null,
    created_at: data.created_at,
    updated_at: data.updated_at,
    task_count: data.tasks?.[0]?.count ?? 0,
  };
}

// ─── Templates ───────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<TaskTemplate[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServerClient()) as any;
  const { data } = await supabase
    .from('task_templates')
    .select('id, name, description, created_by, created_at, task_template_items(count)')
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((t: any) => ({
    id: t.id,
    name: t.name,
    description: t.description ?? null,
    created_by: t.created_by ?? null,
    created_at: t.created_at,
    item_count: t.task_template_items?.[0]?.count ?? 0,
  }));
}

export async function getTemplateWithItems(id: string): Promise<{ template: TaskTemplate; items: TaskTemplateItem[] } | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServerClient()) as any;
  const { data } = await supabase
    .from('task_templates')
    .select('id, name, description, created_by, created_at, task_template_items(id, title, description, priority, status, duration_value, duration_unit, category_id, position, task_categories(id, name, color, position))')
    .eq('id', id)
    .single();

  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: TaskTemplateItem[] = (data.task_template_items ?? []).map((i: any) => ({
      id: i.id,
      template_id: id,
      title: i.title,
      description: i.description ?? null,
      priority: i.priority as TaskTemplateItem['priority'],
      status: i.status as TaskTemplateItem['status'],
      duration_value: i.duration_value ?? null,
      duration_unit: i.duration_unit ?? null,
      category_id: i.category_id ?? null,
      category: i.task_categories ?? null,
      position: i.position,
    }))
    .sort((a: TaskTemplateItem, b: TaskTemplateItem) => a.position - b.position);

  return {
    template: {
      id: data.id,
      name: data.name,
      description: data.description ?? null,
      created_by: data.created_by ?? null,
      created_at: data.created_at,
      item_count: items.length,
    },
    items,
  };
}
