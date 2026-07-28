import { EventTypesAdmin } from '@/components/features/calendrier/admin/EventTypesAdmin';
import { getCalendarEventTypes } from '@/components/features/calendrier/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminCalendrierTypesPage() {
  await handlePageAccess(isAdmin);
  const eventTypes = await getCalendarEventTypes();

  return (
    <Main
      variant="admin"
      title="Types d'évènements"
      subtitle="Glissez-déposez pour réordonner."
      breadcrumbs={[
        { label: 'Calendrier', href: '/choristes/calendrier' },
        { label: 'Administration', href: '/choristes/admin/calendrier' },
      ]}
      breadcrumbCurrent="Types d'évènements"
    >
      <EventTypesAdmin initialEventTypes={eventTypes} />
    </Main>
  );
}
