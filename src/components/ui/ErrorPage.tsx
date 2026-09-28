'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

import { Button } from '@/components/ui/Button';
import { TitleFlourish } from '@/components/ui/TitleFlourish';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  backHref?: string;
  backLabel?: string;
}

export function ErrorPage({
  error,
  reset,
  backHref = '/',
  backLabel = "Retour à l'accueil",
}: ErrorPageProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-board">
      <p aria-hidden="true" className="font-display text-7xl text-primary-light/25 mb-4">
        ♭
      </p>
      <h1 className="text-2xl font-semibold text-foreground">Une erreur est survenue</h1>
      <TitleFlourish className="my-4" />
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        Fausse note ! Une erreur inattendue s&apos;est produite. L&apos;équipe a été notifiée
        automatiquement.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" size="md" onClick={reset}>
          Réessayer
        </Button>
        {/* <a> natif : on veut un rechargement complet après une erreur, pas une navigation client */}
        <a
          href={backHref}
          className="inline-flex items-center px-4 py-2 rounded-xl border border-primary-deep bg-primary text-white text-sm font-semibold no-underline btn-token"
        >
          {backLabel}
        </a>
      </div>
    </main>
  );
}
