import { cn } from '@/lib/utils';

const CORNER_CLASS =
  'absolute font-display text-2xl leading-none text-secondary pointer-events-none select-none';

// Panneau du hero façon carte à jouer : cadre doré et indices dans les coins (note / reine du logo)
export function HeroCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'animate-card-deal relative px-8 py-10 md:px-14 md:py-12 rounded-3xl bg-backdrop/55 backdrop-blur-sm frame-gold',
        className,
      )}
    >
      <span aria-hidden="true" className={cn(CORNER_CLASS, 'top-4 left-5')}>
        ♪
      </span>
      <span aria-hidden="true" className={cn(CORNER_CLASS, 'bottom-4 right-5 rotate-180')}>
        ♛
      </span>
      {children}
    </div>
  );
}
