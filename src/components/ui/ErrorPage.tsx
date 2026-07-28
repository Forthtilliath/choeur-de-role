'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  backHref?: string;
  backLabel?: string;
}

export function ErrorPage({ error, reset, backHref = '/', backLabel = "Retour à l'accueil" }: ErrorPageProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-light text-foreground/20 mb-6">!</p>
      <h1 className="text-xl font-semibold text-foreground mb-2">Une erreur est survenue</h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        Une erreur inattendue s&apos;est produite. L&apos;équipe a été notifiée automatiquement.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Réessayer
        </button>
        <a
          href={backHref}
          className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {backLabel}
        </a>
      </div>
    </main>
  );
}
