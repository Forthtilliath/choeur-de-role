'use client';

export default function OfflinePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <div className="text-5xl">🎵</div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-foreground">Vous êtes hors-ligne</h1>
        <p className="text-foreground/60 max-w-sm">
          Cette page n&apos;est pas disponible sans connexion. Reconnectez-vous pour accéder au site.
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 rounded-lg border border-border text-sm text-foreground/70 hover:text-foreground hover:border-primary transition-colors"
      >
        Réessayer
      </button>
    </main>
  );
}
