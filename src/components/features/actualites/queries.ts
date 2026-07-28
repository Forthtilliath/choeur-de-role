import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import { News } from './types';

export const NEWS_PAGE_SIZE = 8;

function scheduledFilter() {
  return `scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`;
}

export async function getNewsQuery(): Promise<{ pinned: News[]; regular: News[]; hasMore: boolean }> {
  const supabase = await createServerClient();

  const [pinnedResult, regularResult] = await Promise.all([
    supabase
      .from('news')
      .select('*, news_files(*)')
      .eq('published', true)
      .eq('pinned', true)
      .or(scheduledFilter())
      .order('order_index'),
    supabase
      .from('news')
      .select('*, news_files(*)')
      .eq('published', true)
      .eq('pinned', false)
      .or(scheduledFilter())
      .order('order_index')
      .range(0, NEWS_PAGE_SIZE - 1),
  ]);

  if (pinnedResult.error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des actualités.');
  if (regularResult.error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des actualités.');

  return {
    pinned: (pinnedResult.data ?? []) as unknown as News[],
    regular: (regularResult.data ?? []) as unknown as News[],
    hasMore: (regularResult.data ?? []).length === NEWS_PAGE_SIZE,
  };
}

export async function getNewsAdminQuery(): Promise<News[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('news')
    .select('*, news_files(*)')
    .order('order_index');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des actualités.');
  return data as unknown as News[];
}
