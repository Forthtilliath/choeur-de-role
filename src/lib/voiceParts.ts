import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import { Tables } from '@/types/database';

type VoicePart = Tables<'voice_parts'>;

export async function getVoiceParts(): Promise<VoicePart[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from('voice_parts').select('*').order('order_index');

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des pupitres.');
  }
  return data;
}

export async function getChoristerVoiceParts(): Promise<VoicePart[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('voice_parts')
    .select('*')
    .eq('is_voice_part', true)
    .order('order_index');

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des pupitres.');
  }
  return data;
}
