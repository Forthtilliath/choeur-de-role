import { cn } from '@/lib/utils';

// Ornement sous un titre : deux traits dorés autour d'un losange (le pion sur la portée)
export function TitleFlourish({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('flex items-center justify-center gap-2', className)}>
      <span className="h-px w-12 bg-linear-to-r from-transparent to-secondary" />
      <span className="size-2 rotate-45 rounded-[1px] bg-secondary" />
      <span className="h-px w-12 bg-linear-to-l from-transparent to-secondary" />
    </div>
  );
}
