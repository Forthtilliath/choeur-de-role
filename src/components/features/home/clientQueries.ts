import { createClient } from '@/lib/supabase.client';
import { getCurrentTimestampString } from '@/lib/utils';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';
import type { Block } from './types';

// — Hero —

export async function uploadHeroImage(file: File): Promise<string | null> {
  try {
    return await uploadImageToR2(file, 'home/hero.webp');
  } catch {
    return null;
  }
}

export async function saveContentBlock(
  page: string,
  blockKey: string,
  content: string,
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('content_blocks')
    .upsert({ page, block_key: blockKey, content }, { onConflict: 'page,block_key' });
}

// — Blocs —

export async function updateBlockOrder(id: string, orderIndex: number): Promise<void> {
  const supabase = createClient();
  await supabase.from('home_blocks').update({ order_index: orderIndex }).eq('id', id);
}

export async function toggleBlockActive(id: string, active: boolean): Promise<void> {
  const supabase = createClient();
  await supabase.from('home_blocks').update({ active }).eq('id', id);
}

export async function deleteBlock(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('home_blocks').delete().eq('id', id);
}

export async function updateBlockContent(id: string, content: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('home_blocks')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function uploadBlockImage(id: string, file: File): Promise<string | null> {
  const supabase = createClient();
  try {
    const publicUrl = await uploadImageToR2(
      file,
      `home/blocks/${id}-${getCurrentTimestampString()}.webp`,
    );
    await supabase.from('home_blocks').update({ image_url: publicUrl }).eq('id', id);
    return publicUrl;
  } catch {
    return null;
  }
}

export async function removeBlockImage(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from('home_blocks').update({ image_url: null }).eq('id', id);
}

export async function updateBlockRatio(id: string, ratio: '4/3' | '3/4'): Promise<void> {
  const supabase = createClient();
  await supabase.from('home_blocks').update({ image_ratio: ratio }).eq('id', id);
}

export async function insertBlock(content: string, orderIndex: number): Promise<Block | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('home_blocks')
    .insert({ content, order_index: orderIndex, active: true, is_join_section: false })
    .select()
    .single();
  if (error) return null;
  return data as Block;
}
