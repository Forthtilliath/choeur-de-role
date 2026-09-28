import { cn } from '@/lib/utils';

// Badge « À venir » : un jeton doré posé sur l'affiche
export function UpcomingBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-ink font-semibold shadow-md ring-1 ring-secondary-dark/30',
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rotate-45 rounded-[1px] bg-ink/70" />À venir
    </span>
  );
}
