'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase.server';
import { isAdmin } from '@/lib/auth';
import type { MemberRole } from '@/lib/roles';
import {
  getMemberRoleForOnboarding,
  updateAdminOnboarding,
} from '@/components/features/onboarding/queries';

export async function completeAdminOnboarding(): Promise<boolean> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const role = await getMemberRoleForOnboarding(user.id);
  if (!role || !isAdmin(role as MemberRole)) return false;

  const ok = await updateAdminOnboarding(user.id);
  if (!ok) return false;

  const cookieStore = await cookies();
  cookieStore.set('admin_onboarded', '1', {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return true;
}
