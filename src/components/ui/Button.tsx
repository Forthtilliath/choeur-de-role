import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-semibold disabled:opacity-40 disabled:pointer-events-none no-underline hover:cursor-pointer border',
  {
    variants: {
      // Les variantes pleines sont des jetons (btn-token) : tranche foncée, s'enfoncent au clic
      variant: {
        primary: 'bg-primary border-primary-deep text-white btn-token',
        outline:
          'text-primary-light border-primary/60 hover:border-primary hover:bg-primary/10 transition-colors',
        secondary:
          'bg-secondary border-secondary-dark/50 text-ink btn-token [--token-edge:var(--color-secondary-dark)]',
        'outline-secondary':
          'text-secondary-dark dark:text-secondary border-secondary-dark/60 dark:border-secondary/60 hover:bg-secondary/15 transition-colors',
        ghost: 'text-foreground hover:bg-muted hover:text-foreground transition-colors',
        'ghost-white': 'text-white/80 hover:bg-white/10 hover:text-white transition-colors',
        white:
          'bg-white/10 text-white border-white/50 backdrop-blur-sm hover:bg-white/20 hover:border-white/80 transition-colors',
        danger:
          'bg-red-600 border-red-800 text-white btn-token [--token-edge:var(--color-red-800)]',
        link: 'text-foreground/70 hover:text-foreground transition-colors border-0',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        default: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

type Props = VariantProps<typeof buttonVariants> & {
  href?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  title?: string;
};

function Spinner() {
  return (
    <svg
      className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export function Button({
  href,
  target,
  rel,
  onClick,
  variant,
  size,
  children,
  className,
  disabled,
  loading,
  type = 'button',
  title,
}: Props) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        target={target}
        rel={rel}
        title={title}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
