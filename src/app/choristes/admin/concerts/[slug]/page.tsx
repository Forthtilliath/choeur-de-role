import {
  getOrphanPerformancesQuery,
  getPerformancesFromSlugQuery,
  getSeasonsWithPerformancesQuery,
} from '@/components/features/concerts';
import { ConcertsAdminClient } from '@/components/features/concerts/admin/ConcertsAdminClient';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { withNotFound } from '@/lib/withNotFound';

export default async function AdminConcertEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await handlePageAccess(isAdmin);

  const [seasons, orphaned, performance] = await Promise.all([
    getSeasonsWithPerformancesQuery(),
    getOrphanPerformancesQuery(),
    withNotFound(() => getPerformancesFromSlugQuery(slug)),
  ]);

  return (
    <Main variant="admin" title="Programmation" breadcrumbs={[{ label: 'Concerts', href: '/concerts' }]}
      breadcrumbCurrent="Administration">
      <ConcertsAdminClient
        initialSeasons={seasons}
        initialOrphaned={orphaned}
        editPerformanceId={performance.id}
      />
    </Main>
  );
}
