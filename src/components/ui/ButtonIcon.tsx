import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonIconVariants = cva(
  'inline-flex items-center justify-center rounded-lg border text-foreground/60 hover:text-foreground transition-all hover:cursor-pointer',
  {
    variants: {
      variant: {
        default: 'border-border hover:border-primary',
        primary: 'border-primary text-white bg-primary hover:bg-primary/80',
        outline: 'border-border border-primary/80 hover:border-primary bg-transparent hover:bg-primary/10',
        danger:
          'border-red-500 bg-red-500 text-white hover:text-white transition-opacity hover:opacity-80',
      },
      size: {
        sm: 'size-7.5 p-1',
        default: 'size-9.5 p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonIconProps = VariantProps<typeof buttonIconVariants> & {
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function ButtonIcon({
  onClick,
  title,
  variant,
  size,
  disabled,
  className,
  children,
}: ButtonIconProps) {
  const classes = cn(buttonIconVariants({ variant, size }), className);

  return (
    <button onClick={onClick} title={title} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
