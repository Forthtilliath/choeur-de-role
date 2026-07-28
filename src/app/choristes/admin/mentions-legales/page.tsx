import { MentionsLegalesAdminClient } from '@/components/features/mentions-legales/MentionsLegalesAdminClient';
import { getLegalData } from '@/components/features/mentions-legales/queries';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { Main } from '@/components/ui/Main';

export default async function AdminMentionsLegalesPage() {
  await handlePageAccess(isAdmin);
  const legalData = await getLegalData();

  return (
    <Main
      variant="admin"
      size="sm"
      title="Mentions légales"
      subtitle="Ces informations apparaissent sur les pages mentions légales, CGU et politique de confidentialité."
      breadcrumbs={[{ label: 'Mentions légales', href: '/mentions-legales' }]}
      breadcrumbCurrent="Administration"
    >
      <MentionsLegalesAdminClient initialData={legalData} />
    </Main>
  );
}
