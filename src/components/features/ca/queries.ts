import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import { CaMeeting } from './types';

export async function getCaMeetingsQuery(): Promise<CaMeeting[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('ca_meetings')
    .select('*')
    .eq('published', true)
    .order('meeting_date', { ascending: false });

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des réunions CA.');
  return data;
}

export async function getCaMeetingsAdminQuery(): Promise<CaMeeting[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('ca_meetings')
    .select('*')
    .order('meeting_date', { ascending: false });

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des réunions CA.');
  return data;
}
