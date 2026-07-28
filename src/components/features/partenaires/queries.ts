import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import { Tables } from '@/types/database';

export type Partner = Tables<'partners'>;

export async function getPartners(): Promise<Partner[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('active', true)
    .order('order_index');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des partenaires.');
  return data;
}
