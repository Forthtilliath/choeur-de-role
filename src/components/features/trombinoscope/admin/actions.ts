'use server';

import { createServerClient } from '@/lib/supabase.server';
import { getMemberAuditHistory, saveMemberAdmin } from '../queries';
import type { AdminMember } from '../types';

export { getMemberAuditHistory };

type UpdateMemberPayload = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birthday: string | null;
  address: string | null;
  zip_code: string | null;
  city: string | null;
  voice_part_id: string | null;
  role: string;
  bureau_role: string | null;
};

export async function saveMemberAdminAction(
  id: string,
  payload: UpdateMemberPayload,
): Promise<AdminMember | null> {
  const authClient = await createServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return null;

  const { data: caller } = await authClient
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!['admin', 'super_admin'].includes(caller?.role ?? '')) return null;

  return saveMemberAdmin(id, payload, user.id);
}
