import { getSeasonsQuery } from '@/components/features/concerts/queries';
import { getChoristerVoiceParts, getAdminVoiceParts } from '@/components/features/pupitres/queries';
import { MembresAdminClient } from '@/components/features/trombinoscope/admin/MembresAdminClient';
import { getMembersForTrombiAdmin } from '@/components/features/trombinoscope/queries';
import { getUsers } from '@/components/features/trombinoscope/queries';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { Main } from '@/components/ui/Main';

export default async function AdminMembresPage() {
  const { role: currentUserRole } = await handlePageAccess(isAdmin);

  const isSuperAdmin = currentUserRole === 'super_admin';
  const [members, voiceParts, users, seasons] = await Promise.all([
    getMembersForTrombiAdmin(),
    isSuperAdmin ? getAdminVoiceParts() : getChoristerVoiceParts(),
    getUsers(),
    getSeasonsQuery(),
  ]);

  return (
    <Main
      variant="admin"
      size="lg"
      title="Gestion des membres"
      breadcrumbs={[{ label: 'Trombinoscope', href: '/choristes/trombinoscope' }]}
      breadcrumbCurrent="Administration"
    >
      <MembresAdminClient
        initialMembers={members}
        voiceParts={voiceParts}
        currentUserRole={currentUserRole}
        authMap={users}
        seasons={seasons}
      />
    </Main>
  );
}
