import { PollsAdminClient } from '@/components/features/sondages/admin/PollsAdminClient';
import { getPolls } from '@/components/features/sondages/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminSondagesPage() {
  const user = await handlePageAccess(isAdmin);
  const polls = await getPolls();

  return (
    <Main
      variant="admin"
      title="Sondages"
      subtitle="Créez et gérez les sondages à destination des choristes."
      breadcrumbs={[{ label: 'Sondages', href: '/choristes/sondages' }]}
      breadcrumbCurrent="Administration"
    >
      <PollsAdminClient initialPolls={polls} memberId={user.id} />
    </Main>
  );
}
