import { createClient } from '@/lib/supabase.client';
import { createServerClient } from '@/lib/supabase.server';
import { AppError } from './appError';

export async function getContentBlocks(page: string): Promise<Record<string, string>> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('content_blocks').select('*').eq('page', page);

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des blocs de contenu.');
  }

  return data.reduce<Record<string, string>>(
    (acc, block) => ({ ...acc, [block.block_key]: block.content }),
    {},
  );
}

export async function updateContentBlock(page: string, blockKey: string, content: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('content_blocks')
    .upsert(
      { page, block_key: blockKey, content, updated_at: new Date().toISOString() },
      { onConflict: 'page,block_key' },
    );

  if (error) throw error;
}
