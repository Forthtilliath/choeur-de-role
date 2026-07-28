import { SaisonsAdminClient } from '@/components/features/concerts/admin/SaisonsAdminClient';
import { getSeasonsQuery } from '@/components/features/concerts/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminSaisonsPage() {
  await handlePageAccess(isAdmin);

  const seasons = await getSeasonsQuery();

  return (
    <Main variant="admin" title="Gestion des saisons" breadcrumbs={[{ label: 'Concerts', href: '/concerts' }]}
      breadcrumbCurrent="Administration">
      <SaisonsAdminClient initialSeasons={seasons} />
    </Main>
  );
}
