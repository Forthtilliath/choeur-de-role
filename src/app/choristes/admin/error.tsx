'use client';

import { ErrorPage } from '@/components/ui/ErrorPage';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      backHref="/choristes/admin/tableau-de-bord"
      backLabel="Retour au tableau de bord"
    />
  );
}
