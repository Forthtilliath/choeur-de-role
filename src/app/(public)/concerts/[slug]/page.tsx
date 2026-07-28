import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import NextImage from 'next/image';
import {
  getAlbumsForPerformance,
  getPerformancesFromSlugQuery,
  VenueButton,
} from '@/components/features/concerts';
import { GalerieClient } from '@/components/features/galerie/GalerieClient';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { getUserQuery } from '@/lib/auth';
import { withNotFound } from '@/lib/withNotFound';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import { formatLongDateTime } from '@/utils/dateHelpers';
import { sortAlbumPhotos } from '@/utils/galleryHelpers';
import { sortPerformanceDates } from '@/utils/performanceHelpers';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const performance = await getPerformancesFromSlugQuery(slug);
    const dates = sortPerformanceDates(performance.performance_dates);
    const firstDate = dates[0];

    const description = [
      `Concert du ${SITE_NAME}`,
      firstDate && `le ${formatLongDateTime(firstDate.date)}`,
      performance.venue && `à ${performance.venue}`,
    ]
      .filter(Boolean)
      .join(' — ');

    const pageUrl = `${SITE_URL}/concerts/${slug}`;
    const ogImage =
      performance.image_url ??
      `${SITE_URL}/api/og?title=${encodeURIComponent(performance.title)}&subtitle=${encodeURIComponent(description)}`;

    return {
      title: performance.title,
      description,
      alternates: { canonical: pageUrl },
      openGraph: {
        title: performance.title,
        description,
        url: pageUrl,
        images: [{ url: ogImage, width: 1200, height: 630, alt: performance.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: performance.title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return { title: 'Concert' };
  }
}

async function AlbumsSection({ performanceId, canEdit }: { performanceId: string; canEdit: boolean }) {
  const albums = await getAlbumsForPerformance(performanceId);
  const sortedAlbums = sortAlbumPhotos(albums);
  if (sortedAlbums.length === 0) return null;
  return (
    <section className="mt-10 md:mt-20">
      <div className="border-t border-border mb-6 md:mb-12" />
      <h2 className="text-xl font-medium text-foreground mb-8">Photos du concert</h2>
      <GalerieClient albums={sortedAlbums} canEdit={canEdit} />
    </section>
  );
}

export default async function ConcertPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ isAdmin: canEdit }, performance] = await Promise.all([
    getUserQuery(),
    withNotFound(() => getPerformancesFromSlugQuery(slug)),
  ]);
  const shareUrl = `${SITE_URL}/concerts/${slug}`;

  const dates = sortPerformanceDates(performance.performance_dates);
  const now = new Date();
  const isUpcoming = dates.some((d) => new Date(d.date) >= now);

  const eventJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: performance.title,
    url: `${SITE_URL}/concerts/${performance.slug}`,
    ...(performance.image_url && { image: performance.image_url }),
    ...(performance.venue && {
      location: {
        '@type': 'Place',
        name: performance.venue,
        address: { '@type': 'PostalAddress', addressLocality: 'Angers', addressCountry: 'FR' },
      },
    }),
    ...(dates.length > 0 && { startDate: dates[0].date }),
    performer: { '@type': 'MusicGroup', name: SITE_NAME, url: SITE_URL },
    organizer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 mb-8">
        <Button href="/concerts" variant="link" className="p-0">
          <ArrowLeft className="w-5 h-5 sm:mr-2" />
          <span className="inline">Tous les concerts</span>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-start">
        <div className="relative rounded-2xl overflow-hidden bg-background-secondary w-full aspect-poster">
          {performance.image_url ? (
            <NextImage
              src={performance.image_url}
              alt={performance.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl">🎵</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {performance.seasons && (
            <span className="text-xs text-foreground/50 bg-background-secondary px-3 py-1 rounded-full self-start">
              {performance.seasons.label}
            </span>
          )}

          <div>
            <h1 className="text-3xl font-medium text-foreground mb-2">{performance.title}</h1>
            {isUpcoming && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary text-white">À venir</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {performance.venue && (
              <div className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <VenueButton venue={performance.venue} />
              </div>
            )}

            {dates.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📅</span>
                  <p className="text-sm font-medium text-foreground">
                    {dates.length > 1 ? 'Dates' : 'Date'}
                  </p>
                </div>
                <div className="flex flex-col gap-1 ml-9">
                  {dates.map((d) => (
                    <p key={d.id} className="text-sm text-foreground/70 first-letter:uppercase">
                      {formatLongDateTime(d.date)}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {performance.ticket_url && isUpcoming && (
              <Button href={performance.ticket_url} target="_blank" rel="noopener noreferrer">
                Réserver ma place →
              </Button>
            )}
            {performance.external_url && isUpcoming && (
              <Button
                href={performance.external_url}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
              >
                En savoir plus →
              </Button>
            )}
            <ShareButtons url={shareUrl} title={performance.title} />
          </div>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mt-10 md:mt-20">
            <div className="border-t border-border mb-6 md:mb-12" />
            <div className="flex items-center gap-3 mb-8">
              <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        }
      >
        <AlbumsSection performanceId={performance.id} canEdit={canEdit} />
      </Suspense>
    </main>
  );
}
