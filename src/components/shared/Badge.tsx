import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center py-0.5 px-2 rounded-lg text-xs border border-background font-semibold',
  {
    variants: {
      variant: {
        alto: 'bg-alto text-black',
        bass: 'bg-bass text-black',
        tenor: 'bg-tenor text-black',
        soprano: 'bg-soprano text-black',
      },
    },
  },
);

export type BadgeVariant = 'alto' | 'bass' | 'tenor' | 'soprano';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    text: string;
  };

export function Badge({ variant, text, className, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {text}
    </span>
  );
}
