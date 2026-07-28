import { createClient } from '@/lib/supabase.client';
import { MemberLink, Visibility } from './types';

export async function updateLinksOrder(items: { id: string; order_index: number }[]): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    items.map((l) => supabase.from('member_links').update({ order_index: l.order_index }).eq('id', l.id)),
  );
}

export async function toggleLinkActive(id: string, active: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('member_links').update({ active }).eq('id', id);
  return !error;
}

export async function deleteLink(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('member_links').delete().eq('id', id);
  return !error;
}

export async function upsertLink(
  payload: {
    label: string;
    url: string;
    description: string | null;
    visibility: Visibility;
  },
  id?: string,
): Promise<MemberLink | null> {
  const supabase = createClient();
  if (id) {
    const { data, error } = await supabase
      .from('member_links')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  const { data, error } = await supabase
    .from('member_links')
    .insert({ ...payload, order_index: 9999, active: true })
    .select()
    .single();
  if (error) return null;
  return data;
}