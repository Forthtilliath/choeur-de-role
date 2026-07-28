'use server';

import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase.server';
import type { MemberRole } from '@/lib/roles';
import type { DurationUnit, TaskPriority, TaskStatus } from '@/types/tasks';

async function getAdminAuth() {
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
  if (!member || !isAdmin(member.role as MemberRole)) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { userId: user.id, db: supabase as any };
}

const REVALIDATE = () => revalidatePath('/choristes/admin/bureau/templates', 'layout');

export async function createTemplate(input: {
  name: string;
  description?: string;
}): Promise<{ ok: true; id: string } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  const { data, error } = await auth.db
    .from('task_templates')
    .insert({ name: input.name, description: input.description || null, created_by: auth.userId })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Erreur' };
  REVALIDATE();
  return { ok: true, id: data.id };
}

export async function updateTemplate(
  id: string,
  input: { name?: string; description?: string | null },
): Promise<{ ok: true } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;

  await auth.db.from('task_templates').update(updates).eq('id', id);
  REVALIDATE();
  return { ok: true };
}

export async function deleteTemplate(id: string): Promise<{ ok: true } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  await auth.db.from('task_templates').delete().eq('id', id);
  REVALIDATE();
  return { ok: true };
}

export async function addTemplateItem(
  templateId: string,
  input: {
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    duration_value?: number | null;
    duration_unit?: DurationUnit | null;
    category_id?: string | null;
  },
): Promise<{ ok: true; id: string } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  const { data: last } = await auth.db
    .from('task_template_items')
    .select('position')
    .eq('template_id', templateId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (last?.position ?? 0) + 1000;

  const { data, error } = await auth.db
    .from('task_template_items')
    .insert({
      template_id: templateId,
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      status: input.status,
      duration_value: input.duration_value ?? null,
      duration_unit: input.duration_unit ?? null,
      category_id: input.category_id ?? null,
      position,
    })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Erreur' };
  REVALIDATE();
  return { ok: true, id: data.id };
}

export async function updateTemplateItem(
  id: string,
  input: {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    duration_value?: number | null;
    duration_unit?: DurationUnit | null;
    category_id?: string | null;
  },
): Promise<{ ok: true } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.status !== undefined) updates.status = input.status;
  if (input.duration_value !== undefined) updates.duration_value = input.duration_value;
  if (input.duration_unit !== undefined) updates.duration_unit = input.duration_unit;
  if (input.category_id !== undefined) updates.category_id = input.category_id;

  await auth.db.from('task_template_items').update(updates).eq('id', id);
  REVALIDATE();
  return { ok: true };
}

export async function deleteTemplateItem(id: string): Promise<{ ok: true } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  await auth.db.from('task_template_items').delete().eq('id', id);
  REVALIDATE();
  return { ok: true };
}

export async function reorderTemplateItems(
  updates: { id: string; position: number }[],
): Promise<{ ok: true } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  await Promise.all(
    updates.map(({ id, position }) =>
      auth.db.from('task_template_items').update({ position }).eq('id', id),
    ),
  );
  REVALIDATE();
  return { ok: true };
}
