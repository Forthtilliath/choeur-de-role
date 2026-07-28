import { CAAdminClient } from '@/components/features/ca/CAAdminClient';
import { getCaMeetingsAdminQuery } from '@/components/features/ca/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isCa } from '@/lib/auth';

export default async function AdminCAPage() {
  await handlePageAccess(isCa);
  const meetings = await getCaMeetingsAdminQuery();

  return (
    <Main variant="admin" title="Gestion des comptes-rendus CA" breadcrumbs={[{ label: 'Espace CA', href: '/choristes/ca' }]}
      breadcrumbCurrent="Administration">
      <CAAdminClient initialMeetings={meetings} />
    </Main>
  );
}
