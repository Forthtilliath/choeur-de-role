import { createClient } from '@/lib/supabase.client';
import { getCurrentTimestampString } from '@/lib/utils';
import { uploadDocToR2 } from '@/utils/uploadDocToR2';
import { News, NewsFile } from './types';

export async function updateNewsOrder(items: { id: string; order_index: number }[]): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    items.map((n) => supabase.from('news').update({ order_index: n.order_index }).eq('id', n.id)),
  );
}

export async function toggleNewsPublished(id: string, published: boolean): Promise<boolean> {
  const supabase = createClient();
  // Publier via le bouton toggle = publication immédiate → on efface le scheduler
  const { error } = await supabase
    .from('news')
    .update({ published, ...(published ? { scheduled_at: null } : {}) })
    .eq('id', id);
  return !error;
}

export async function toggleNewsPinned(id: string, pinned: boolean): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('news').update({ pinned }).eq('id', id);
  return !error;
}

export async function deleteNews(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('news').delete().eq('id', id);
  return !error;
}

export async function upsertNews(
  payload: { title: string; content: string; scheduled_at?: string | null; published?: boolean },
  id?: string,
  orderIndex?: number,
): Promise<News | null> {
  const supabase = createClient();
  if (id) {
    const { data, error } = await supabase
      .from('news')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, news_files(*)')
      .single();
    if (error) return null;
    return data as unknown as News;
  }
  const { data, error } = await supabase
    .from('news')
    .insert({
      title: payload.title,
      content: payload.content,
      scheduled_at: payload.scheduled_at ?? null,
      published: payload.published ?? false,
      pinned: false,
      order_index: orderIndex ?? 0,
    })
    .select('*, news_files(*)')
    .single();
  if (error) return null;
  return data as unknown as News;
}

export async function uploadNewsFile(
  newsId: string,
  file: File,
  label: string,
): Promise<NewsFile | null> {
  const supabase = createClient();
  const ext = file.name.split('.').pop();
  const key = `documents/news/${newsId}-${getCurrentTimestampString()}.${ext}`;

  const fileUrl = await uploadDocToR2(file, key).catch(() => null);
  if (!fileUrl) return null;

  const { data, error } = await supabase
    .from('news_files')
    .insert({ news_id: newsId, file_url: fileUrl, label })
    .select()
    .single();

  return error ? null : data;
}

export async function deleteNewsFile(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('news_files').delete().eq('id', id);
  return !error;
}
