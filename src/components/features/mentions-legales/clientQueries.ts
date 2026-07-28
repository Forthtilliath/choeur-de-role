import { createClient } from '@/lib/supabase.client';
import { LegalData } from './types';

const CENTER_KEYS = ['center_lat', 'center_lng', 'center_label'];

export async function saveLegalData(data: LegalData): Promise<boolean> {
  const supabase = createClient();
  const results = await Promise.all(
    Object.entries(data).map(([block_key, content]) => {
      const page = CENTER_KEYS.includes(block_key) ? 'carte' : 'legal';
      return supabase
        .from('content_blocks')
        .upsert({ page, block_key, content }, { onConflict: 'page,block_key' });
    }),
  );
  return results.every(({ error }) => !error);
}
