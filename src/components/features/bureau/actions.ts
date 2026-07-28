'use server';

import { revalidatePath } from 'next/cache';
import { isAdmin, isCa } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase.server';
import type { MemberRole } from '@/lib/roles';
import type { DurationUnit, TaskPriority, TaskStatus } from '@/types/tasks';

async function getCaAuth() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: member } = await supabase
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();
  const role = member?.role as MemberRole | undefined;
  if (!role || !isCa(role)) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { userId: user.id, isAdmin: isAdmin(role), db: supabase as any };
}

const REVALIDATE = () => revalidatePath('/choristes/bureau/taches', 'layout');

export async function createTask(input: {
  project_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
  duration_value?: number | null;
  duration_unit?: DurationUnit | null;
  category_id?: string | null;
  status: TaskStatus;
  assignee_ids: string[];
}): Promise<{ ok: true; id: string } | { error: string }> {
  const auth = await getCaAuth();
  if (!auth) return { error: 'Non autorisé' };

  const { data: lastTask } = await auth.db
    .from('tasks')
    .select('position')
    .eq('project_id', input.project_id)
    .eq('status', input.status)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (lastTask?.position ?? 0) + 1000;

  const { data: task, error } = await auth.db
    .from('tasks')
    .insert({
      project_id: input.project_id,
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      due_date: input.due_date || null,
      duration_value: input.duration_value ?? null,
      duration_unit: input.duration_unit ?? null,
      category_id: input.category_id ?? null,
      status: input.status,
      position,
      created_by: auth.userId,
    })
    .select('id')
    .single();

  if (error || !task) return { error: error?.message ?? 'Erreur' };

  if (input.assignee_ids.length > 0) {
    await auth.db.from('task_assignees').insert(
      input.assignee_ids.map((mid) => ({ task_id: task.id, member_id: mid })),
    );
  }

  REVALIDATE();
  return { ok: true, id: task.id };
}

export async function updateTask(
  taskId: string,
  input: {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    due_date?: string | null;
    duration_value?: number | null;
    duration_unit?: DurationUnit | null;
    category_id?: string | null;
    assignee_ids?: string[];
  },
): Promise<{ ok: true } | { error: string }> {
  const auth = await getCaAuth();
  if (!auth) return { error: 'Non autorisé' };

  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.due_date !== undefined) updates.due_date = input.due_date;
  if (input.duration_value !== undefined) updates.duration_value = input.duration_value;
  if (input.duration_unit !== undefined) updates.duration_unit = input.duration_unit;
  if (input.category_id !== undefined) updates.category_id = input.category_id;

  if (Object.keys(updates).length > 0) {
    await auth.db.from('tasks').update(updates).eq('id', taskId);
  }

  if (input.assignee_ids !== undefined) {
    await auth.db.from('task_assignees').delete().eq('task_id', taskId);
    if (input.assignee_ids.length > 0) {
      await auth.db.from('task_assignees').insert(
        input.assignee_ids.map((mid) => ({ task_id: taskId, member_id: mid })),
      );
    }
  }

  REVALIDATE();
  return { ok: true };
}

export async function deleteTask(taskId: string): Promise<{ ok: true } | { error: string }> {
  const auth = await getCaAuth();
  if (!auth) return { error: 'Non autorisé' };

  if (!auth.isAdmin) {
    const { data: task } = await auth.db
      .from('tasks')
      .select('created_by')
      .eq('id', taskId)
      .single();
    if (task?.created_by !== auth.userId) {
      return { error: 'Seul le créateur ou un administrateur peut supprimer cette tâche.' };
    }
  }

  await auth.db.from('tasks').delete().eq('id', taskId);
  REVALIDATE();
  return { ok: true };
}

export async function reorderTasks(
  updates: { id: string; status: TaskStatus; position: number }[],
): Promise<{ ok: true } | { error: string }> {
  const auth = await getCaAuth();
  if (!auth) return { error: 'Non autorisé' };
  await Promise.all(
    updates.map(({ id, status, position }) =>
      auth.db.from('tasks').update({ status, position }).eq('id', id),
    ),
  );
  REVALIDATE();
  return { ok: true };
}

export async function addComment(
  taskId: string,
  content: string,
): Promise<{ ok: true; id: string } | { error: string }> {
  const auth = await getCaAuth();
  if (!auth) return { error: 'Non autorisé' };
  const { data, error } = await auth.db
    .from('task_comments')
    .insert({ task_id: taskId, author_id: auth.userId, content })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message ?? 'Erreur' };
  REVALIDATE();
  return { ok: true, id: data.id };
}

export async function deleteComment(commentId: string): Promise<{ ok: true } | { error: string }> {
  const auth = await getCaAuth();
  if (!auth) return { error: 'Non autorisé' };
  await auth.db.from('task_comments').delete().eq('id', commentId);
  REVALIDATE();
  return { ok: true };
}
