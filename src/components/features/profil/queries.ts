import { AppError } from '@/lib/appError';
import { getUserQuery } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase.server';
import { MemberProfile } from './types';

export async function getProfileInfo(): Promise<MemberProfile> {
  const userRoleInfo = await getUserQuery();
  if (!userRoleInfo.isLoggedIn) throw new AppError('UNAUTHORIZED', 'Non connecté');

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('members')
    .select(`*, voice_parts!members_voice_part_id_fkey (id, name, group_name, order_index)`)
    .eq('id', userRoleInfo.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') throw new AppError('NOT_FOUND', 'Membre non trouvé.');
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération du profil.');
  }

  return data as MemberProfile;
}
