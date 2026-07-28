import { ProfilClient } from '@/components/features/profil/ProfilClient';
import { getProfileInfo } from '@/components/features/profil/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess } from '@/lib/auth';

export default async function ProfilPage() {
  await handlePageAccess();
  const member = await getProfileInfo();

  return (
    <Main variant="choriste" title="Mon profil">
      <ProfilClient member={member} />
    </Main>
  );
}
