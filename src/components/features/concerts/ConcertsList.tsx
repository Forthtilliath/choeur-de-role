import { ConcertCard } from './ConcertCard';
import type { PerformanceDatesWithSeasons } from './types';

export function ConcertsList({
  performances,
  title,
  isPast = false,
  className = '',
}: {
  performances: PerformanceDatesWithSeasons[];
  title: string;
  isPast?: boolean;
  className?: string;
}) {
  if (performances.length === 0) return null;

  return (
    <section className={className}>
      <div className="border-t border-border mb-12" />
      <h2 className="text-xl font-medium text-foreground/60 mb-8">{title}</h2>
      <div
        className={`grid mb-8 ${isPast ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'}`}
      >
        {performances.map((p, i) => (
          <ConcertCard key={p.id} performance={p} past={isPast} priority={i < 4} />
        ))}
      </div>
    </section>
  );
}
