import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { getExternalEventBySlugQuery } from '@/components/features/externals/queries';
import { Button } from '@/components/ui/Button';
import { JsonLd } from '@/components/ui/JsonLd';
import { LocationMap } from '@/components/ui/LocationMap';
import { PosterFrame } from '@/components/ui/PosterFrame';
import { SafeHtml } from '@/components/ui/SafeHtml';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { StaffDivider } from '@/components/ui/StaffDivider';
import { TitleFlourish } from '@/components/ui/TitleFlourish';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import { withNotFound } from '@/lib/withNotFound';
import { formatEventDateRange, formatLongDateTime } from '@/utils/dateHelpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id: slug } = await params;
  try {
    const event = await getExternalEventBySlugQuery(slug);
    const dates = [...event.external_event_dates].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const firstDate = dates[0];

    const description = [
      event.description ? undefined : `Évènement externe`,
      firstDate && `le ${formatLongDateTime(firstDate.date)}`,
      event.location && `à ${event.location}`,
    ]
      .filter(Boolean)
      .join(' — ');

    const pageUrl = `${SITE_URL}/evenements/${slug}`;
    const desc = description || event.title;
    const ogImage =
      event.image_url ??
      `${SITE_URL}/api/og?title=${encodeURIComponent(event.title)}&subtitle=${encodeURIComponent(desc)}`;

    return {
      title: event.title,
      description: desc,
      alternates: { canonical: pageUrl },
      openGraph: {
        title: event.title,
        description: desc,
        url: pageUrl,
        images: [{ url: ogImage, width: 1200, height: 630, alt: event.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description: desc,
        images: [ogImage],
      },
    };
  } catch {
    return { title: 'Évènement' };
  }
}

export default async function EvenementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = await params;
  const event = await withNotFound(() => getExternalEventBySlugQuery(slug));
  const shareUrl = `${SITE_URL}/evenements/${slug}`;

  const sortedDates = [...event.external_event_dates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  // eslint-disable-next-line @eslint-react/purity -- Server Component : évalué une fois par requête
  const now = new Date();
  const isUpcoming = sortedDates.some((d) => new Date(d.date) >= now);

  const pageUrl = `${SITE_URL}/evenements/${slug}`;
  const plainDescription = event.description?.replace(/<[^>]*>/g, '').trim() || undefined;
  const organizer = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };
  const buildOccurrence = (d: (typeof sortedDates)[number]) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: d.date,
    ...(d.end_date && { endDate: d.end_date }),
    url: pageUrl,
    ...(event.image_url && { image: event.image_url }),
    ...(event.location && { location: { '@type': 'Place', name: event.location } }),
    ...(plainDescription && { description: plainDescription }),
    ...(event.external_url && { sameAs: event.external_url }),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    organizer,
  });
  const occurrences = sortedDates.map(buildOccurrence);
  const eventJsonLd = occurrences.length === 1 ? occurrences[0] : occurrences;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <JsonLd data={eventJsonLd} />
      <div className="flex flex-wrap items-center justify-between gap-2 mb-8">
        <Button href="/evenements" variant="link" className="p-0">
          <ArrowLeft className="w-5 h-5 sm:mr-2" />
          <span className="inline">Tous les évènements</span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-start">
        {/* Affiche */}
        <PosterFrame
          src={event.image_url}
          alt={event.title}
          fallback="🎭"
          upcoming={isUpcoming}
        />

        {/* Infos */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-dark dark:text-secondary">
              Évènement extérieur
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground">{event.title}</h1>
            <TitleFlourish className="justify-start mt-4" />
          </div>

          <div className="card-game p-5 flex flex-col gap-3">
            {/* Dates */}
            {sortedDates.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📅</span>
                  <p className="text-sm font-medium text-foreground">
                    {sortedDates.length > 1 ? 'Dates' : 'Date'}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-9">
                  {sortedDates.map((d) => (
                    <p key={d.id} className="text-sm text-foreground/70 first-letter:uppercase">
                      {formatEventDateRange(d.date, d.end_date)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Lieu */}
            {event.location && <LocationMap location={event.location} />}
          </div>

          {/* Fichiers */}
          {event.external_event_files.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Fichiers</p>
              {event.external_event_files.map((f) => (
                <Link
                  key={f.id}
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-light hover:opacity-70 transition-opacity no-underline"
                >
                  📎 {f.label}
                </Link>
              ))}
            </div>
          )}

          {/* Lien externe */}
          {event.external_url && (
            <Button
              href={event.external_url}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
            >
              En savoir plus →
            </Button>
          )}

          <ShareButtons url={shareUrl} title={event.title} />
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <section className="mt-8 md:mt-16">
          <StaffDivider className="mb-8 md:mb-12" />
          <SafeHtml className="mdx-content max-w-3xl" html={event.description} />
        </section>
      )}
    </main>
  );
}
