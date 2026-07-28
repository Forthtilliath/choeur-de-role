import { cache } from 'react';
import { redirect } from 'next/navigation';
import { AppError } from '@/lib/appError';
import { isAdmin, isCa, isValidDbRole, MemberRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabase.server';

export { isAdmin, isCa, isMember } from '@/lib/roles';

type UserLoggedInfo = {
  id: string;
  role: MemberRole;
  isLoggedIn: true;
  isAdmin: boolean;
  isCa: boolean;
};

type UserNotLoggedInfo = {
  id: null;
  role: null;
  isLoggedIn: false;
  isAdmin: false;
  isCa: false;
};

export type UserRoleInfo = UserLoggedInfo | UserNotLoggedInfo;
export const getUserQuery = cache(async (): Promise<UserRoleInfo> => {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: errorUser,
  } = await supabase.auth.getUser();

  const notLoggedIn: UserNotLoggedInfo = { id: null, role: null, isLoggedIn: false, isAdmin: false, isCa: false };

  if (errorUser || !user) return notLoggedIn;

  const { data: member, error: errorMember } = await supabase
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();

  if (errorMember || !member) return notLoggedIn;

  if (!isValidDbRole(member.role)) {
    throw new AppError('INVALID_ROLE', 'Rôle invalide');
  }

  return {
    id: user.id,
    role: member.role,
    isLoggedIn: true,
    isAdmin: isAdmin(member.role),
    isCa: isCa(member.role),
  };
});

export async function checkActiveSeasonEnrollment(userId: string): Promise<boolean> {
  const supabase = await createServerClient();

  const { data: activeSeason } = await supabase
    .from('seasons')
    .select('id')
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  // Aucune saison active configurée → pas de restriction
  if (!activeSeason) return true;

  const { data: enrollment } = await supabase
    .from('member_season')
    .select('id')
    .eq('member_id', userId)
    .eq('season_id', activeSeason.id)
    .limit(1)
    .maybeSingle();

  return enrollment !== null;
}

export async function handlePageAccess(
  requireAccess?: (role: MemberRole) => boolean,
): Promise<UserLoggedInfo> {
  const userRoleInfo = await getUserQuery();
  if (!userRoleInfo.isLoggedIn) {
    redirect('/login');
  }

  if (requireAccess && !requireAccess(userRoleInfo.role)) {
    redirect('/choristes');
  }

  if (userRoleInfo.isAdmin && requireAccess) {
    const supabase = await createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const [{ data: aal }, { data: factors }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(session?.access_token),
      supabase.auth.mfa.listFactors(),
    ]);
    const hasTotp = factors?.totp?.some((f) => f.status === 'verified');
    const mfaPending = aal && aal.nextLevel === 'aal2' && aal.currentLevel !== aal.nextLevel;
    if (!hasTotp || mfaPending) {
      redirect('/login');
    }
  }

  return userRoleInfo;
}
