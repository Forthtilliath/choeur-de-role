'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SafeHtml } from '@/components/ui/SafeHtml';
import { UpcomingBadge } from '@/components/ui/UpcomingBadge';
import { useNow } from '@/hooks/useNow';
import { formatEventDateRange } from '@/utils/dateHelpers';

import { ChoirPlaceholder } from './ChoirPlaceholder';
import type { ExternalEvent } from './types';

export function EventCard({
  event,
  isPast,
  priority = false,
}: {
  event: ExternalEvent;
  isPast: boolean;
  priority?: boolean;
}) {
  const router = useRouter();
  const now = new Date(useNow());
  const sortedDates = [...event.external_event_dates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const displayDates = isPast ? sortedDates : sortedDates.filter((d) => new Date(d.date) >= now);

  return (
    <div
      className={`cursor-pointer group card-game card-lift overflow-hidden flex flex-col h-full ${
        isPast ? 'opacity-75 hover:opacity-100' : ''
      }`}
      onClick={() => router.push(`/evenements/${event.slug ?? event.id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/evenements/${event.slug ?? event.id}`)}
    >
      {/* Image */}
      <div className="relative bg-background-secondary aspect-poster overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={priority}
          />
        ) : (
          <ChoirPlaceholder />
        )}
        {!isPast && <UpcomingBadge className="absolute top-2 right-2" />}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1 border-t border-border">
        <h3 className="text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary-light transition-colors">
          {event.title}
        </h3>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            {displayDates.length > 0 && (
              <div className="flex items-start gap-1">
                <span className="shrink-0 text-xs">📅</span>
                <div className="flex flex-col gap-0.5">
                  {displayDates.slice(0, 2).map((d) => (
                    <p key={d.id} className="text-xs text-foreground/60">
                      {formatEventDateRange(d.date, d.end_date)}
                    </p>
                  ))}
                  {displayDates.length > 2 && (
                    <p className="text-xs text-foreground/40">
                      + {displayDates.length - 2} autre{displayDates.length - 2 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}
            {event.location && (
              <p className="text-xs text-foreground/60 flex items-center gap-1">
                <span className="shrink-0">📍</span>
                <span className="truncate">{event.location}</span>
              </p>
            )}
          </div>

          {event.description && (
            <SafeHtml
              className="text-xs text-foreground/45 line-clamp-2 mdx-content"
              html={event.description}
            />
          )}

          {(event.external_event_files.length > 0 || event.external_url) && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
              {event.external_event_files.map((f) => (
                <Link
                  key={f.id}
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 text-primary-light hover:opacity-70 transition-opacity no-underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  📎 {f.label}
                </Link>
              ))}
              {event.external_url && (
                <Link
                  href={event.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-center py-1.5 rounded-xl border border-primary/50 text-primary-light no-underline hover:border-primary hover:bg-primary/10 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  En savoir plus →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
