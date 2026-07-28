import { notFound } from 'next/navigation';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase.server';
import { Main } from '@/components/ui/Main';
import { PrintButton } from '@/components/features/concerts/programme/PrintButton';
import { sortPerformanceDates } from '@/utils/performanceHelpers';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default async function ConcertProgrammePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await handlePageAccess(isAdmin);

  const supabase = await createServerClient();

  const { data: performance } = await supabase
    .from('performances')
    .select(
      `
      id, title, season_id,
      performance_dates (id, date, venue),
      seasons (label),
      songs:song_performance (
        song:songs (id, title, composer)
      )
    `,
    )
    .eq('slug', slug)
    .single();

  if (!performance) notFound();

  const dates = sortPerformanceDates(performance.performance_dates);

  const songs = (performance.songs ?? [])
    .map((s: { song: { id: string; title: string; composer: string | null } | null }) => s.song)
    .filter(Boolean)
    .sort((a, b) => a!.title.localeCompare(b!.title, 'fr'));

  return (
    <>
      <style>{`
        @media print {
          nav, aside, header, footer { display: none !important; }
          .md\\:pl-52 { padding-left: 0 !important; }
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          @page { margin: 2cm; size: A4; }
        }
      `}</style>

      <Main
        variant="admin"
        size="md"
        breadcrumbs={[
          { label: 'Concerts', href: '/concerts' },
          { label: 'Administration', href: '/choristes/admin/concerts' },
          { label: performance.title, href: `/choristes/admin/concerts/${slug}` },
        ]}
        breadcrumbCurrent="Programme"
        breadcrumbActions={<PrintButton />}
        breadcrumbClassName="no-print"
      >
        <div className="font-serif text-foreground">

          {/* En-tête */}
          <div className="text-center mb-10 print:mb-8">
            <p className="text-xs tracking-widest uppercase text-foreground/50 print:text-gray-500 mb-3">
              Chœur de Rôle
              {performance.seasons && ` · ${performance.seasons.label}`}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground print:text-black mb-6 leading-tight">
              {performance.title}
            </h1>

            {dates.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {dates.map((d) => (
                  <div key={d.id} className="text-sm text-foreground/70 print:text-gray-600">
                    <span className="first-letter:uppercase">{formatDate(d.date)}</span>
                    {d.venue && (
                      <span className="text-foreground/40 print:text-gray-400"> · {d.venue}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {songs.length > 0 && (
            <>
              <div className="border-t border-foreground/10 print:border-gray-300 mb-10 print:mb-8" />
              <section>
                <h2 className="text-xs tracking-widest uppercase text-foreground/50 print:text-gray-500 mb-5">
                  Programme musical
                </h2>
                <ol className="flex flex-col gap-3">
                  {songs.map((song, i) => (
                    <li key={song!.id} className="flex items-baseline gap-3">
                      <span className="text-foreground/30 print:text-gray-400 text-sm tabular-nums w-5 shrink-0 text-right">
                        {i + 1}.
                      </span>
                      <span className="text-foreground print:text-black">
                        {song!.title}
                        {song!.composer && (
                          <span className="text-foreground/50 print:text-gray-500 text-sm italic">
                            {' '}— {song!.composer}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}

          {songs.length === 0 && (
            <p className="text-center text-foreground/40 print:text-gray-400 text-sm py-8">
              Aucun chant associé à ce concert.
            </p>
          )}
        </div>
      </Main>
    </>
  );
}
