import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  ConcertsClient,
  getPerformancesQuery,
} from '@/components/features/concerts';
import { Main } from '@/components/ui/Main';

export const metadata: Metadata = {
  title: 'Concerts',
  description:
    'Tous les concerts du Chœur de Rôle à Angers : spectacles à venir et concerts passés. Chant choral, variété et classique.',
  alternates: { canonical: 'https://www.choeur-de-role.fr/concerts' },
  openGraph: { url: 'https://www.choeur-de-role.fr/concerts' },
};

export default async function ConcertsPage() {
  const performances = await getPerformancesQuery();

  return (
    <Main
      title="Nos concerts"
      subtitle="Retrouvez tous nos concerts et évènements passés et à venir."
    >
      <Suspense>
        <ConcertsClient performances={performances} />
      </Suspense>
    </Main>
  );
}
