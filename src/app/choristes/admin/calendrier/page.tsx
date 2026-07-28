import { CalendrierClient } from '@/components/features/calendrier/CalendrierClient';
import { buildBirthdayEvents } from '@/components/features/calendrier/birthdayHelpers';
import {
  getBirthdayMembersAdmin,
  getCalendarEvents,
  getCalendarEventTypes,
} from '@/components/features/calendrier/queries';

import { Button } from '@/components/ui/Button';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminCalendrierPage() {
  await handlePageAccess(isAdmin);

  const [events, eventTypes, birthdayMembers] = await Promise.all([
    getCalendarEvents(),
    getCalendarEventTypes(),
    getBirthdayMembersAdmin(),
  ]);

  const birthdayType = eventTypes.find((et) => et.label === 'Anniversaire');
  const now = new Date();
  const currentYear = now.getFullYear();

  const birthdayEvents = birthdayType
    ? [
        ...buildBirthdayEvents(birthdayMembers, currentYear, birthdayType, true),
        ...buildBirthdayEvents(birthdayMembers, currentYear + 1, birthdayType, true).map((b) => ({
          ...b,
          id: `${b.id}-next`,
        })),
      ]
    : [];

  const allEvents = [...events, ...birthdayEvents];

  const birthdayCountsByMonth: Record<number, number> = {};
  for (const m of birthdayMembers) {
    if (m.birthday) {
      const month = parseInt(m.birthday.split('-')[1], 10) - 1;
      birthdayCountsByMonth[month] = (birthdayCountsByMonth[month] ?? 0) + 1;
    }
  }

  return (
    <Main
      variant="admin"
      title="Calendrier"
      breadcrumbs={[{ label: 'Calendrier', href: '/choristes/calendrier' }]}
      breadcrumbCurrent="Administration"
      actions={
        <Button href="/choristes/admin/calendrier/types" variant="outline" size="sm">
          ⚙️ Types d&apos;évènements
        </Button>
      }
    >
      <CalendrierClient
        initialEvents={allEvents}
        eventTypes={eventTypes}
        canEdit={true}
        birthdayCountsByMonth={birthdayCountsByMonth}
      />
    </Main>
  );
}
