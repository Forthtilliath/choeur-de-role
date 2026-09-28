'use client';

import { Button } from '@/components/ui/Button';
import { TitleFlourish } from '@/components/ui/TitleFlourish';

export default function OfflinePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 py-16 text-center bg-board">
      <div className="text-5xl">🎵</div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Vous êtes hors-ligne</h1>
        <TitleFlourish className="my-2" />
        <p className="text-foreground/60 max-w-sm">
          Pause entre deux manches : cette page n&apos;est pas disponible sans connexion.
          Reconnectez-vous pour accéder au site.
        </p>
      </div>
      <Button variant="outline" size="md" onClick={() => window.location.reload()}>
        Réessayer
      </Button>
    </main>
  );
}
