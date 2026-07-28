import { redirect } from 'next/navigation';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { Main } from '@/components/ui/Main';
import { AdminOnboarding } from '@/components/features/onboarding/AdminOnboarding';
import { getMemberForAdminOnboarding } from '@/components/features/onboarding/queries';
import type { MemberRole } from '@/lib/roles';

export const metadata = { title: 'Bienvenue — Administration' };

export default async function AdminBienvenuePage() {
  const user = await handlePageAccess((role) => isAdmin(role));
  const member = await getMemberForAdminOnboarding(user.id);

  if (member?.admin_onboarded_at || !isAdmin(member?.role as MemberRole)) {
    redirect('/choristes/admin/tableau-de-bord');
  }

  const firstName = member?.first_name ?? 'Administrateur';

  return (
    <Main variant="admin" title="">
      <AdminOnboarding firstName={firstName} />
    </Main>
  );
}
