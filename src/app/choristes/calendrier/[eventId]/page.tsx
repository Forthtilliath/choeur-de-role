import { Suspense } from 'react';
import { CalendrierClient } from '@/components/features/calendrier/CalendrierClient';
import { buildBirthdayEvents } from '@/components/features/calendrier/birthdayHelpers';
import {
  getBirthdayMembers,
  getCalendarEvents,
  getCalendarEventTypes,
} from '@/components/features/calendrier/queries';
import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';

async function CalendarContent({ eventId }: { eventId: string }) {
  const [events, eventTypes, birthdayMembers] = await Promise.all([
    getCalendarEvents(),
    getCalendarEventTypes(),
    getBirthdayMembers(),
  ]);

  const birthdayType = eventTypes.find((et) => et.label === 'Anniversaire');
  const now = new Date();
  const currentYear = now.getFullYear();

  const birthdayEvents = birthdayType
    ? [
        ...buildBirthdayEvents(birthdayMembers, currentYear, birthdayType),
        ...buildBirthdayEvents(birthdayMembers, currentYear + 1, birthdayType).map((b) => ({
          ...b,
          id: `${b.id}-next`,
        })),
      ]
    : [];

  return (
    <CalendrierClient
      initialEvents={[...events, ...birthdayEvents]}
      eventTypes={eventTypes}
      canEdit={false}
      initialEventId={eventId}
    />
  );
}

export default async function CalendrierEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return (
    <Main variant="choriste" title="Calendrier">
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10" />
            <div className="grid lg:grid-cols-[1fr_260px] gap-4">
              <Skeleton className="h-120" />
              <Skeleton className="h-120 hidden lg:block" />
            </div>
          </div>
        }
      >
        <CalendarContent eventId={eventId} />
      </Suspense>
    </Main>
  );
}
