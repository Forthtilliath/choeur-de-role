import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-light text-foreground/20 mb-6">404</p>
      <h1 className="text-xl font-semibold text-foreground mb-2">Page introuvable</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
