import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export function Select({ className, wrapperClassName, children, ...props }: Props) {
  return (
    <div className={cn('relative w-fit', wrapperClassName)}>
      <select
        className={cn(
          'w-full appearance-none border border-border rounded-lg pl-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors',
          className,
          'pr-8',
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40"
      />
    </div>
  );
}
