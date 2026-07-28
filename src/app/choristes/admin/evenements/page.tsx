import { EvenementsAdminClient } from '@/components/features/externals/admin/EvenementsAdminClient';
import { getExternalEventsAdminQuery } from '@/components/features/externals/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminEvenementsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  await handlePageAccess(isAdmin);
  const [{ edit }, events] = await Promise.all([searchParams, getExternalEventsAdminQuery()]);

  return (
    <Main variant="admin" title="Évènements externes" breadcrumbs={[{ label: 'Évènements', href: '/evenements' }]}
      breadcrumbCurrent="Administration">
      <EvenementsAdminClient initialEvents={events} editEventId={edit} />
    </Main>
  );
}
