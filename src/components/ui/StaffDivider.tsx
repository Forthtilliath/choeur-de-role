import { cn } from '@/lib/utils';

type Props = {
  /** Glyphe au centre de la portée (note, pièce de jeu…) */
  symbol?: string;
  /** Fond du médaillon central — doit correspondre au fond de la section */
  surfaceClassName?: string;
  className?: string;
};

// Séparateur décoratif : une portée à 5 lignes avec un médaillon en losange au centre
export function StaffDivider({
  symbol = '♪',
  surfaceClassName = 'bg-background',
  className,
}: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative flex items-center justify-center text-primary-light/20', className)}
    >
      <div className="bg-staff w-full" />
      <span
        className={cn(
          'absolute grid place-items-center size-9 rotate-45 rounded-md border border-secondary/60 shadow-sm',
          surfaceClassName,
        )}
      >
        <span className="-rotate-45 font-display text-lg leading-none text-secondary-dark dark:text-secondary">
          {symbol}
        </span>
      </span>
    </div>
  );
}
