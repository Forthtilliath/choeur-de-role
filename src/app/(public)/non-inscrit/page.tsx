import type { Metadata } from 'next';

import { Button } from '@/components/ui/Button';
import { TitleFlourish } from '@/components/ui/TitleFlourish';

export const metadata: Metadata = { title: 'Accès non autorisé' };

export default function NonInscritPage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-6">🎵</div>
      <h1 className="text-3xl font-semibold text-foreground">Saison non ouverte</h1>
      <TitleFlourish className="my-4" />
      <p className="text-foreground/60 mb-8 leading-relaxed">
        Vous n&apos;êtes pas inscrit à la saison en cours. Contactez un administrateur pour être
        ajouté à la nouvelle saison.
      </p>
      <Button href="/" variant="outline">
        Retour à l&apos;accueil
      </Button>
    </main>
  );
}
