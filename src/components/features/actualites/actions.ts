'use server';

import { createServerClient } from '@/lib/supabase.server';
import { News } from './types';
import { NEWS_PAGE_SIZE } from './queries';

export async function fetchMoreNews(offset: number): Promise<{ news: News[]; hasMore: boolean }> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('news')
    .select('*, news_files(*)')
    .eq('published', true)
    .eq('pinned', false)
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order('order_index')
    .range(offset, offset + NEWS_PAGE_SIZE - 1);

  if (error || !data) return { news: [], hasMore: false };

  return { news: data as unknown as News[], hasMore: data.length === NEWS_PAGE_SIZE };
}
