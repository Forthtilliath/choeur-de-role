import {
  getOrphanPerformancesQuery,
  getSeasonsWithPerformancesQuery,
} from '@/components/features/concerts';
import { ConcertsAdminClient } from '@/components/features/concerts/admin/ConcertsAdminClient';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminConcertsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await handlePageAccess(isAdmin);
  const { edit } = await searchParams;

  const [seasons, orphaned] = await Promise.all([
    getSeasonsWithPerformancesQuery(),
    getOrphanPerformancesQuery(),
  ]);

  return (
    <Main variant="admin" title="Programmation" breadcrumbs={[{ label: 'Concerts', href: '/concerts' }]}
      breadcrumbCurrent="Administration">
      <ConcertsAdminClient
        initialSeasons={seasons}
        initialOrphaned={orphaned}
        editPerformanceId={edit}
      />
    </Main>
  );
}
