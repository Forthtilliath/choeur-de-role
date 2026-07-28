import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import { LegalData } from './types';

export async function getLegalData(): Promise<LegalData> {
  const supabase = await createServerClient();
  const [{ data: legalData, error: legalError }, { data: carteData, error: carteError }] =
    await Promise.all([
      supabase.from('content_blocks').select('block_key, content').eq('page', 'legal'),
      supabase.from('content_blocks').select('block_key, content').eq('page', 'carte'),
    ]);

  if (legalError || carteError)
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des données légales.');

  const legal = Object.fromEntries((legalData ?? []).map((b) => [b.block_key, b.content]));
  const carte = Object.fromEntries((carteData ?? []).map((b) => [b.block_key, b.content]));
  return { ...legal, ...carte };
}
