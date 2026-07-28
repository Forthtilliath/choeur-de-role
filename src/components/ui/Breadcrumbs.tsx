import React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type CrumbItem = { label: string; href: string };

type Props = {
  crumbs?: CrumbItem[];
  current?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function Breadcrumbs({ crumbs, current = 'Administration', backHref, backLabel, actions, className }: Props) {
  const links: CrumbItem[] = crumbs ?? (backHref && backLabel ? [{ label: backLabel, href: backHref }] : []);

  return (
    <div className={cn('flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-background-secondary text-sm', className)}>
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-foreground/50 flex-wrap">
        {links.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={13} className="shrink-0" />}
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          </span>
        ))}
        {links.length > 0 && <ChevronRight size={13} className="shrink-0" />}
        <span className="text-foreground font-medium">{current}</span>
      </nav>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
