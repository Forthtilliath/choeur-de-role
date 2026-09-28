import { StaffDivider } from '@/components/ui/StaffDivider';
import { cn } from '@/lib/utils';

type Props = {
  children: React.ReactNode;
  /** Glyphe du médaillon de la portée */
  symbol?: string;
  /** Titre atténué (ex : « Évènements passés ») */
  muted?: boolean;
  className?: string;
};

// Titre de section précédé d'une portée : remplace le couple « trait + h2 »
export function SectionHeading({ children, symbol, muted = false, className }: Props) {
  return (
    <div className={cn('mb-8', className)}>
      <StaffDivider symbol={symbol} className="mb-8" />
      <h2 className={cn('text-2xl font-semibold', muted ? 'text-foreground/70' : 'text-foreground')}>
        {children}
      </h2>
    </div>
  );
}
