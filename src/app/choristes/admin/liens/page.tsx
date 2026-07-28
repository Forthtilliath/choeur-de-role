import { LiensAdminClient } from '@/components/features/liens/LiensAdminClient';
import { getMemberLinksAdminQuery } from '@/components/features/liens/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isCa } from '@/lib/auth';

export default async function AdminLiensPage() {
  await handlePageAccess(isCa);
  const links = await getMemberLinksAdminQuery();

  return (
    <Main variant="admin" title="Gestion des liens" breadcrumbs={[{ label: 'Liens choristes', href: '/choristes/liens' }]}
      breadcrumbCurrent="Administration">
      <LiensAdminClient initialLinks={links ?? []} />
    </Main>
  );
}
