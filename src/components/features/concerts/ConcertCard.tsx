import Link from 'next/link';
import { formatDate } from '@/utils/dateHelpers';
import { sortPerformanceDates } from '@/utils/performanceHelpers';
import { CardImage } from './CardImage';
import { PerformanceDatesWithSeasons } from './types';

export function ConcertCard({
  performance,
  past = false,
  priority = false,
}: {
  performance: PerformanceDatesWithSeasons;
  past?: boolean;
  priority?: boolean;
}) {
  const dates = sortPerformanceDates(performance.performance_dates);
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const dateDisplay =
    dates.length === 0
      ? null
      : dates.length === 1
        ? formatDate(firstDate.date)
        : `${formatDate(firstDate.date)} — ${formatDate(lastDate.date)}`;

  const slug = performance.slug;

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-border bg-background flex flex-col transition-all ${past ? 'opacity-70 hover:opacity-100' : 'hover:border-primary/50'}`}
    >
      {/* Image cliquable vers la page détail */}
      {slug ? (
        <Link href={`/concerts/${slug}`} className="no-underline">
          <CardImage performance={performance} past={past} priority={priority} />
        </Link>
      ) : (
        <CardImage performance={performance} past={past} priority={priority} />
      )}

      {/* Contenu */}
      <div className="p-4 flex flex-col gap-2 flex-1 border-t border-border">
        {slug ? (
          <Link href={`/concerts/${slug}`} className="no-underline">
            <h3 className="text-sm font-medium text-foreground leading-snug hover:text-primary transition-colors">
              {performance.title}
            </h3>
          </Link>
        ) : (
          <h3 className="text-sm font-medium text-foreground leading-snug">{performance.title}</h3>
        )}

        <div className="flex flex-col gap-1 mt-auto min-h-10">
          {dateDisplay && (
            <p className="text-xs text-foreground/60 flex items-center gap-1">
              <span>📅</span>
              <span>{dateDisplay}</span>
            </p>
          )}
          {performance.venue && (
            <p className="text-xs text-foreground/60 flex items-center gap-1">
              <span>📍</span>
              <span>{performance.venue}</span>
            </p>
          )}
          {dates.length > 1 && (
            <p className="text-xs text-foreground/40">{dates.length} représentations</p>
          )}
        </div>

        {performance.ticket_url && !past && (
          <Link
            href={performance.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-xs text-center py-1.5 rounded-lg bg-primary text-white no-underline hover:opacity-80 transition-opacity"
          >
            Réserver
          </Link>
        )}
      </div>
    </div>
  );
}
