import { ActualitesAdminClient } from '@/components/features/actualites/ActualitesAdminClient';
import { getNewsAdminQuery } from '@/components/features/actualites/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminActualitesPage() {
  await handlePageAccess(isAdmin);
  const news = await getNewsAdminQuery();

  return (
    <Main
      variant="admin"
      title="Gestion des actualités"
      breadcrumbs={[{ label: 'Actualités choristes', href: '/choristes' }]}
      breadcrumbCurrent="Administration"
    >
      <ActualitesAdminClient initialNews={news} />
    </Main>
  );
}
