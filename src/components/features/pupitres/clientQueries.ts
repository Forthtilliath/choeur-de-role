import { createClient } from '@/lib/supabase.client';
import { VoicePart } from './types';

export async function updateVoicePartsOrder(
  items: { id: string; order_index: number }[],
): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    items.map((vp) =>
      supabase.from('voice_parts').update({ order_index: vp.order_index }).eq('id', vp.id),
    ),
  );
}

export async function updateVoicePartsGroupAndOrder(
  items: { id: string; order_index: number; group_name: string | null }[],
): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    items.map((vp) =>
      supabase
        .from('voice_parts')
        .update({ order_index: vp.order_index, group_name: vp.group_name })
        .eq('id', vp.id),
    ),
  );
}

export async function deleteVoicePart(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('voice_parts').delete().eq('id', id);
  return !error;
}

export async function upsertVoicePart(
  payload: { name: string; group_name: string | null },
  id?: string,
  orderIndex?: number,
): Promise<VoicePart | null> {
  const supabase = createClient();
  if (id) {
    const { data, error } = await supabase
      .from('voice_parts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  const { data, error } = await supabase
    .from('voice_parts')
    .insert({ ...payload, order_index: orderIndex ?? 0 })
    .select()
    .single();
  if (error) {
    console.error('[PupitresAdminClient] Erreur insert:', error);
    return null;
  }
  return data;
}
