'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-xl font-semibold">Une erreur inattendue est survenue</h2>
          <p className="text-foreground/60 text-sm">
            L&apos;erreur a été signalée automatiquement.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
