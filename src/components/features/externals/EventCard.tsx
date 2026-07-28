'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatEventDateRange } from '@/utils/dateHelpers';
import { ExternalEvent } from './types';

function ChoirPlaceholder() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-b from-primary/5 to-primary/15 text-primary">
      <svg
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4/5 max-w-40"
        aria-hidden="true"
      >
        {/* Singer 1 - left */}
        <circle cx="40" cy="40" r="11" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
        <ellipse cx="40" cy="45" rx="3.5" ry="2.5" fill="currentColor" fillOpacity="0.4" />
        <path d="M29 54 Q31 84 40 88 Q49 84 51 54 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <path d="M35 62 Q26 52 22 44" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M45 62 Q54 52 58 44" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />

        {/* Singer 2 - center, lead */}
        <circle cx="100" cy="30" r="14" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
        <polygon points="88,30 93,18 100,14 107,18 112,30" fill="currentColor" fillOpacity="0.3" />
        <ellipse cx="100" cy="36" rx="5.5" ry="4" fill="currentColor" fillOpacity="0.5" />
        <path d="M86 46 Q89 90 100 95 Q111 90 114 46 Z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
        <line x1="100" y1="46" x2="100" y2="62" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
        <ellipse cx="100" cy="65" rx="4" ry="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1.5" />
        <path d="M91 58 Q78 48 70 42" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M109 58 Q122 48 130 42" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />

        {/* Singer 3 - right */}
        <circle cx="160" cy="40" r="11" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
        <ellipse cx="160" cy="45" rx="3.5" ry="2.5" fill="currentColor" fillOpacity="0.4" />
        <path d="M149 54 Q151 84 160 88 Q169 84 171 54 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <path d="M155 62 Q146 52 142 44" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M165 62 Q174 52 178 44" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />

        {/* Music notes */}
        <text x="10" y="26" fontSize="13" fill="currentColor" fillOpacity="0.35">♪</text>
        <text x="168" y="22" fontSize="16" fill="currentColor" fillOpacity="0.3">♫</text>
        <text x="76" y="14" fontSize="11" fill="currentColor" fillOpacity="0.35">♩</text>
        <text x="116" y="18" fontSize="12" fill="currentColor" fillOpacity="0.3">♬</text>
        <text x="6" y="58" fontSize="9" fill="currentColor" fillOpacity="0.2">♪</text>
        <text x="181" y="55" fontSize="9" fill="currentColor" fillOpacity="0.2">♩</text>

        {/* Stage */}
        <line x1="10" y1="96" x2="190" y2="96" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="30" y1="99" x2="170" y2="99" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <p className="text-[10px] text-primary/40 mt-1 font-medium tracking-widest uppercase">Pas d&apos;affiche</p>
    </div>
  );
}

export function EventCard({ event, isPast, priority = false }: { event: ExternalEvent; isPast: boolean; priority?: boolean }) {
  const router = useRouter();
  const now = new Date();
  const sortedDates = [...event.external_event_dates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const displayDates = isPast
    ? sortedDates
    : sortedDates.filter((d) => new Date(d.date) >= now);


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
              <div
                className="text-xs text-foreground/45 line-clamp-2 mdx-content"
                dangerouslySetInnerHTML={{ __html: event.description }}
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
