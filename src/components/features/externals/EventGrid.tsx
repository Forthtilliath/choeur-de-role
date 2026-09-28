import { SectionHeading } from '@/components/ui/SectionHeading';

import { EventCard } from './EventCard';
import type { ExternalEvent } from './types';

export function EventGrid({
  events,
  title,
  isPast = false,
}: {
  events: ExternalEvent[];
  title: string;
  isPast?: boolean;
}) {
  return (
    <section className="mb-8 md:mb-16">
      <SectionHeading muted={isPast}>{title}</SectionHeading>
      <div
        className={`grid gap-6 ${isPast ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}
      >
        {events.map((event, index) => (
          <EventCard key={event.id} event={event} isPast={isPast} priority={index === 0} />
        ))}
      </div>
    </section>
  );
}
