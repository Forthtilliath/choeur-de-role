import { EventCard } from './EventCard';
import { ExternalEvent } from './types';

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
      <div className="border-t border-border mb-5 md:mb-10" />
      <h2 className="text-xl font-medium text-foreground/60 mb-8">{title}</h2>
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
