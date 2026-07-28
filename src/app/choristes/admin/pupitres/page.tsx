import { PupitresAdminClient } from '@/components/features/pupitres/PupitresAdminClient';
import { getVoiceParts } from '@/components/features/pupitres/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminPupitresPage() {
  await handlePageAccess(isAdmin);

  const voiceParts = await getVoiceParts();

  return (
    <Main variant="admin" title="Gestion des pupitres" breadcrumbs={[{ label: 'Espace choristes', href: '/choristes' }]}
      breadcrumbCurrent="Administration">
      <PupitresAdminClient initialVoiceParts={voiceParts} />
    </Main>
  );
}
