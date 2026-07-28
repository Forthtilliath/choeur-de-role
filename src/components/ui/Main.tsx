import React from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

type Variant = 'public' | 'choriste' | 'admin';

type MainProps = {
  variant?: Variant;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Admin only — href of the public feature page */
  backHref?: string;
  /** Admin only — label shown next to the back arrow */
  backLabel?: string;
  /** Admin only — multi-level breadcrumbs */
  breadcrumbs?: { label: string; href: string }[];
  /** Admin only — libellé du niveau courant */
  breadcrumbCurrent?: string;
  /** Admin only — contenu affiché à droite de la barre breadcrumb (ex : bouton imprimer) */
  breadcrumbActions?: React.ReactNode;
  /** Admin only — className supplémentaire sur la barre breadcrumb */
  breadcrumbClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  // kept for backward compat with legal/content pages — prefer variant="choriste"
  align?: 'default' | 'left';
};

const maxWidth: Record<NonNullable<MainProps['size']>, string> = {
  xs: 'max-w-2xl',
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
};

export function Main({
  variant,
  title,
  subtitle,
  actions,
  backHref,
  backLabel,
  breadcrumbs,
  breadcrumbCurrent,
  breadcrumbActions,
  breadcrumbClassName,
  size = 'lg',
  children,
  className,
  align,
}: MainProps) {
  const effective: Variant = variant ?? (align === 'left' ? 'choriste' : 'public');
  const base = cn('mx-auto px-4', maxWidth[size]);

  /* ── ADMIN ─────────────────────────────────────────────────────────── */
  if (effective === 'admin') {
    const hasBreadcrumbs = breadcrumbs || (backHref && backLabel);
    return (
      <>
        {hasBreadcrumbs && (
          <Breadcrumbs
            crumbs={breadcrumbs}
            current={breadcrumbCurrent}
            backHref={backHref}
            backLabel={backLabel}
            actions={breadcrumbActions}
            className={breadcrumbClassName}
          />
        )}
        <main id="main-content" className={cn(base, 'py-6 md:py-12', className)}>
          {(title || actions) && (
            <div className="flex items-start justify-between gap-4 mb-8">
              <div className="min-w-0">
                {title && (
                  <h1 className="text-2xl font-medium text-foreground">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-foreground/70 mt-1">{subtitle}</p>
                )}
              </div>
              {actions && <div className="shrink-0">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </>
    );
  }

  /* ── CHORISTE ───────────────────────────────────────────────────────── */
  if (effective === 'choriste') {
    return (
      <main id="main-content" className={cn(base, 'py-6 md:py-12', className)}>
        {(title || actions) && (
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="min-w-0">
              {title && (
                <h1 className="text-2xl font-medium text-foreground">{title}</h1>
              )}
              {subtitle && (
                <p className="text-sm text-foreground/70 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        )}
        {align === 'left' ? (
          <div className="flex flex-col gap-8 text-sm text-foreground/80 leading-relaxed">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
    );
  }

  /* ── PUBLIC (default) ────────────────────────────────────────────────── */
  return (
    <main id="main-content" className={cn(base, 'py-8 md:py-16', className)}>
      {(title || subtitle || actions) && (
        <div className="text-center mb-10 md:mb-16">
          {title && (
            <h1 className="text-3xl md:text-4xl font-medium mb-3 text-foreground">{title}</h1>
          )}
          {subtitle && (
            <p className="text-foreground/70 max-w-xl mx-auto">{subtitle}</p>
          )}
          {actions && <div className="mt-6">{actions}</div>}
        </div>
      )}
      {children}
    </main>
  );
}
