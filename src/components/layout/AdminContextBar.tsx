'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

type AdminLink = { href: string; currentLabel: string };

function resolveAdminLink(pathname: string): AdminLink | null {
  if (pathname.startsWith('/choristes/admin')) return null;

  // Choriste pages — labels = backLabel utilisé par la page admin correspondante
  if (pathname === '/choristes')
    return { href: '/choristes/admin', currentLabel: 'Actualités choristes' };
  if (pathname.startsWith('/choristes/calendrier'))
    return { href: '/choristes/admin/calendrier', currentLabel: 'Calendrier' };
  if (pathname.startsWith('/choristes/repertoire'))
    return { href: '/choristes/admin/mediatheque', currentLabel: 'Répertoire' };
  if (pathname === '/choristes/liens')
    return { href: '/choristes/admin/liens', currentLabel: 'Liens choristes' };
  if (pathname === '/choristes/ca')
    return { href: '/choristes/admin/ca', currentLabel: 'Espace CA' };
  if (pathname === '/choristes/trombinoscope')
    return { href: '/choristes/admin/membres', currentLabel: 'Trombinoscope' };
  if (pathname.startsWith('/choristes/sondages'))
    return { href: '/choristes/admin/sondages', currentLabel: 'Sondages' };
  if (pathname.startsWith('/choristes/bureau/taches'))
    return { href: '/choristes/admin/bureau/projets', currentLabel: 'Tâches' };

  // Public pages
  if (pathname === '/concerts')
    return { href: '/choristes/admin/concerts', currentLabel: 'Concerts' };
  if (pathname.startsWith('/concerts/')) {
    const slug = pathname.slice('/concerts/'.length);
    return { href: `/choristes/admin/concerts/${slug}`, currentLabel: 'Concerts' };
  }
  if (pathname === '/galerie')
    return { href: '/choristes/admin/galerie', currentLabel: 'Galerie' };
  if (pathname === '/evenements')
    return { href: '/choristes/admin/evenements', currentLabel: 'Évènements' };
  if (pathname.startsWith('/evenements/'))
    return { href: '/choristes/admin/evenements', currentLabel: 'Évènements' };
  if (pathname === '/partenaires')
    return { href: '/choristes/admin/sponsors', currentLabel: 'Partenaires' };

  return null;
}

export function AdminContextBar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  if (!isAdmin) return null;

  const link = resolveAdminLink(pathname);
  if (!link) return null;

  return (
    <div className="md:pl-60 border-b border-border bg-background-secondary text-sm">
      <nav
        aria-label="Administration"
        className="px-6 py-3 flex items-center gap-1.5 text-foreground/50"
      >
        <span className="text-foreground font-medium">{link.currentLabel}</span>
        <ChevronRight size={13} className="shrink-0" />
        <Link href={link.href} className="hover:text-foreground transition-colors">
          Administration
        </Link>
      </nav>
    </div>
  );
}
