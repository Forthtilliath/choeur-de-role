import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import { MemberLink } from './types';

export async function getMemberLinksQuery(): Promise<MemberLink[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('member_links')
    .select('*')
    .eq('active', true)
    .order('order_index');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des liens.');
  return data;
}

export async function getMemberLinksAdminQuery(): Promise<MemberLink[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('member_links').select('*').order('order_index');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des liens.');
  return data;
}
