import type { Metadata } from 'next';
import { EventGrid } from '@/components/features/externals/EventGrid';

export const metadata: Metadata = {
  title: 'Évènements externes',
  description:
    "Concerts, expositions et évènements de nos choristes et amis autour d'Angers. Agenda culturel en Maine-et-Loire.",
  alternates: { canonical: 'https://www.choeur-de-role.fr/evenements' },
  openGraph: { url: 'https://www.choeur-de-role.fr/evenements' },
};
import { getExternalEventsQuery } from '@/components/features/externals/queries';
import { Main } from '@/components/ui/Main';

export default async function EvenementsPage() {
  const events = await getExternalEventsQuery();

  const now = new Date();
  const upcoming = events.filter((e) =>
    e.external_event_dates.some((d) => new Date(d.date) >= now),
  );
  const past = events.filter(
    (e) =>
      e.external_event_dates.length > 0 &&
      e.external_event_dates.every((d) => new Date(d.date) < now),
  );

  return (
    <Main
      title="Évènements externes"
      subtitle="Concerts, expositions et évènements de nos choristes et amis."
    >
      {(events ?? []).length === 0 && (
        <p className="text-center text-foreground/50 py-12">Aucun évènement pour le moment.</p>
      )}

      {upcoming.length > 0 && <EventGrid events={upcoming} title="À venir" />}

      {past.length > 0 && <EventGrid events={past} title="Évènements passés" isPast />}
    </Main>
  );
}
