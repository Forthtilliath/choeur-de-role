import { PollsChoristesClient } from '@/components/features/sondages/PollsChoristesClient';
import { getActivePollsForMember } from '@/components/features/sondages/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess } from '@/lib/auth';

export default async function SondagesPage() {
  const user = await handlePageAccess();
  const polls = await getActivePollsForMember();

  return (
    <Main variant="choriste" title="Sondages">
      <PollsChoristesClient polls={polls} memberId={user.id} />
    </Main>
  );
}
