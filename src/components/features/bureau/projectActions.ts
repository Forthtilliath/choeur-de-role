'use server';

import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase.server';
import type { MemberRole } from '@/lib/roles';

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

const REVALIDATE = () => {
  revalidatePath('/choristes/bureau/taches', 'layout');
  revalidatePath('/choristes/admin/bureau/projets');
};

export async function createProject(input: {
  name: string;
  description?: string;
  template_id?: string;
}): Promise<{ ok: true; id: string } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  const { data: project, error } = await auth.db
    .from('task_projects')
    .insert({
      name: input.name,
      description: input.description || null,
      created_by: auth.userId,
    })
    .select('id')
    .single();

  if (error || !project) return { error: error?.message ?? 'Erreur' };

  if (input.template_id) {
    const { data: items } = await auth.db
      .from('task_template_items')
      .select('title, description, priority, status, position')
      .eq('template_id', input.template_id)
      .order('position', { ascending: true });

    if (items && items.length > 0) {
      await auth.db.from('tasks').insert(
        items.map((item: { title: string; description: string | null; priority: string; status: string; position: number }) => ({
          project_id: project.id,
          title: item.title,
          description: item.description,
          priority: item.priority,
          status: item.status,
          position: item.position,
          created_by: auth.userId,
        })),
      );
    }
  }

  REVALIDATE();
  return { ok: true, id: project.id };
}

export async function updateProject(
  id: string,
  input: { name?: string; description?: string | null },
): Promise<{ ok: true } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;

  await auth.db.from('task_projects').update(updates).eq('id', id);
  REVALIDATE();
  return { ok: true };
}

export async function toggleProjectActive(
  id: string,
  is_active: boolean,
): Promise<{ ok: true } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  await auth.db.from('task_projects').update({ is_active }).eq('id', id);
  REVALIDATE();
  return { ok: true };
}

export async function deleteProject(id: string): Promise<{ ok: true } | { error: string }> {
  const auth = await getAdminAuth();
  if (!auth) return { error: 'Non autorisé' };

  await auth.db.from('task_projects').delete().eq('id', id);
  REVALIDATE();
  return { ok: true };
}
