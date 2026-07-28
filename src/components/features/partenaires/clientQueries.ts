import { createClient } from '@/lib/supabase.client';
import { uploadDocToR2 } from '@/utils/uploadDocToR2';
import { Partner } from './types';

export async function togglePartnerActive(id: string, active: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('partners').update({ active }).eq('id', id);
  return !error;
}

export async function deletePartner(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('partners').delete().eq('id', id);
  return !error;
}

export async function updatePartnersOrder(
  items: { id: string; order_index: number }[],
): Promise<boolean> {
  const supabase = createClient();
  const results = await Promise.all(
    items.map((p) =>
      supabase.from('partners').update({ order_index: p.order_index }).eq('id', p.id),
    ),
  );
  return results.every(({ error }) => !error);
}

export async function uploadPartnerLogo(file: File): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const key = `partners/${Date.now()}.${ext}`;
  try {
    return await uploadDocToR2(file, key);
  } catch {
    return null;
  }
}

export async function upsertPartner(
  payload: {
    name: string;
    website_url: string | null;
    size: Partner['size'];
    logo_url: string;
  },
  id?: string,
): Promise<Partner | null> {
  const supabase = createClient();
  if (id) {
    const { data, error } = await supabase
      .from('partners')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }
  const { data, error } = await supabase
    .from('partners')
    .insert({ ...payload, order_index: 9999 })
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function uploadSponsorDossier(file: File): Promise<string | null> {
  const supabase = createClient();
  const key = 'documents/choeur-de-role-dossier-de-sponsoring.pdf';
  const publicUrl = await uploadDocToR2(file, key).catch(() => null);
  if (!publicUrl) return null;
  await supabase
    .from('content_blocks')
    .upsert(
      { page: 'partners', block_key: 'sponsor_dossier_url', content: publicUrl },
      { onConflict: 'page,block_key' },
    );
  return publicUrl;
}
