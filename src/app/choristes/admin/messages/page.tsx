import type { Metadata } from 'next';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { Main } from '@/components/ui/Main';
import { ContactMessagesClient } from '@/components/features/contact-messages/ContactMessagesClient';
import { getContactMessages } from '@/components/features/contact-messages/actions';

export const metadata: Metadata = { title: 'Messages de contact' };

export default async function ContactMessagesPage() {
  await handlePageAccess(isAdmin);
  const messages = await getContactMessages();

  return (
    <Main
      variant="admin"
      size="lg"
      title="Messages de contact"
      breadcrumbs={[{ label: 'Tableau de bord', href: '/choristes/admin/tableau-de-bord' }]}
      breadcrumbCurrent="Administration"
    >
      <ContactMessagesClient messages={messages} />
    </Main>
  );
}
