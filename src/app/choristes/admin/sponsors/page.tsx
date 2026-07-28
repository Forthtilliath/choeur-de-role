import { PartenairesAdminClient } from '@/components/features/partenaires/PartenairesAdminClient';
import { getPartners } from '@/components/features/partenaires/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminPartenairesPage() {
  await handlePageAccess(isAdmin);

  const partners = await getPartners();

  return (
    <Main variant="admin" title="Gestion des sponsors" breadcrumbs={[{ label: 'Partenaires', href: '/partenaires' }]}
      breadcrumbCurrent="Administration">
      <PartenairesAdminClient initialPartners={partners} />
    </Main>
  );
}
