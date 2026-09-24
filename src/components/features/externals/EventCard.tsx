'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { SafeHtml } from '@/components/ui/SafeHtml';
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
      className={`cursor-pointer group rounded-2xl overflow-hidden border bg-background flex flex-col transition-all duration-200 h-full ${
        isPast
          ? 'opacity-70 hover:opacity-100 border-border hover:border-border hover:shadow-md'
          : 'border-border hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5'
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
        {!isPast && (
          <span className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-primary text-white font-medium shadow-sm">
            À venir
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
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
                  className="text-xs flex items-center gap-1 text-primary hover:opacity-70 transition-opacity no-underline"
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
                  className="text-xs text-center py-1.5 rounded-lg border border-border text-foreground/60 no-underline hover:border-primary hover:text-primary transition-all"
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
