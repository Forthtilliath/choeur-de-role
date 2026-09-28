import { Button } from '@/components/ui/Button';
import { TitleFlourish } from '@/components/ui/TitleFlourish';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-board">
      <p aria-hidden="true" className="text-5xl mb-2 text-secondary-dark dark:text-secondary">
        ⚂ ⚀
      </p>
      <p className="font-display text-7xl font-semibold text-primary-light/25 mb-2">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Page introuvable</h1>
      <TitleFlourish className="my-4" />
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        Mauvais jet de dés : cette case n&apos;existe pas sur le plateau, ou elle a été déplacée.
      </p>
      <Button href="/">Retour à la case départ</Button>
    </main>
  );
}
