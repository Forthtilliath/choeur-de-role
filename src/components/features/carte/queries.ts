import { AppError } from '@/lib/appError';
import { createAdminClient, createServerClient } from '@/lib/supabase.server';

const MEMBER_SELECT = `
  id, first_name, last_name, photo_url,
  address, zip_code, city, lat, lng,
  phone, email, bureau_role,
  visibility_email, visibility_phone,
  voice_parts!members_voice_part_id_fkey (id, name, group_name, order_index)
` as const;

export async function getMembersForMap() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('members')
    .select(MEMBER_SELECT)
    .eq('is_test_account', false)
    .eq('visibility_address', true)
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des membres.');

  return (data ?? []).map(({ visibility_email, visibility_phone, ...m }) => ({
    ...m,
    email: visibility_email ? m.email : null,
    phone: visibility_phone ? m.phone : null,
  }));
}

export async function getMembersForMapAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select(MEMBER_SELECT)
    .eq('is_test_account', false)
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des membres.');
  return data ?? [];
}

export type MembreCarte = Awaited<ReturnType<typeof getMembersForMap>>[number];
