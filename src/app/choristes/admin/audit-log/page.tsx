import type { Metadata } from 'next';
import { AuditLogClient } from '@/components/features/dashboard/AuditLogClient';
import { getAllAuditLogs } from '@/components/features/dashboard/queries';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { Main } from '@/components/ui/Main';

export const metadata: Metadata = { title: "Journal d'audit" };

export default async function AuditLogPage() {
  await handlePageAccess(isAdmin);
  const { logs, hasMore } = await getAllAuditLogs();

  return (
    <Main
      variant="admin"
      size="lg"
      title="Journal d'audit"
      breadcrumbs={[{ label: 'Tableau de bord', href: '/choristes/admin/tableau-de-bord' }]}
      breadcrumbCurrent="Administration"
    >
      <AuditLogClient logs={logs} hasMore={hasMore} />
    </Main>
  );
}
