import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const toolbarButtonVariants = cva(
  'size-8 flex items-center justify-center rounded transition-colors shrink-0',
  {
    variants: {
      active: {
        true: 'bg-primary/15 text-primary',
        false: 'text-foreground/50 hover:text-foreground hover:bg-muted',
      },
    },
    defaultVariants: { active: false },
  },
);

export function ToolbarButton({
  onClick,
  active,
  title,
  children,
  className,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(toolbarButtonVariants({ active }), className)}
    >
      {children}
    </button>
  );
}

export function ToolbarSeparator() {
  return <div className="w-px h-5 mx-1 bg-border shrink-0" />;
}
