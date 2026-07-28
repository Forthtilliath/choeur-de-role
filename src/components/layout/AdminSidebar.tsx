'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const groups = [
  {
    label: 'Général',
    links: [
      { href: '/choristes/admin/tableau-de-bord', label: 'Tableau de bord' },
      { href: '/choristes/admin/messages', label: 'Messages de contact' },
      { href: '/choristes/admin/audit-log', label: "Journal d'audit" },
    ],
  },
  {
    label: 'Contenu public',
    links: [
      { href: '/choristes/admin/homepage', label: "Page d'accueil" },
      { href: '/choristes/admin/concerts', label: 'Concerts' },
      { href: '/choristes/admin/galerie', label: 'Galerie photos' },
      { href: '/choristes/admin/evenements', label: 'Événements externes' },
      { href: '/choristes/admin/sponsors', label: 'Partenaires' },
    ],
  },
  {
    label: 'Bureau',
    links: [
      { href: '/choristes/admin/bureau/projets', label: 'Projets' },
      { href: '/choristes/admin/bureau/templates', label: 'Templates' },
    ],
  },
  {
    label: 'Espace choristes',
    links: [
      { href: '/choristes/admin', label: 'Actualités' },
      { href: '/choristes/admin/calendrier', label: 'Calendrier' },
      { href: '/choristes/admin/membres', label: 'Membres' },
      { href: '/choristes/admin/pupitres', label: 'Pupitres' },
      { href: '/choristes/admin/saisons', label: 'Saisons' },
      { href: '/choristes/admin/mediatheque', label: 'Médiathèque' },
      { href: '/choristes/admin/liens', label: 'Liens utiles' },
      { href: '/choristes/admin/ca', label: 'Comptes-rendus CA' },
      { href: '/choristes/admin/sondages', label: 'Sondages' },
    ],
  },
  {
    label: 'Paramètres',
    links: [
      { href: '/choristes/admin/emails', label: 'Emails' },
      { href: '/choristes/admin/mentions-legales', label: 'Mentions légales' },
      { href: '/choristes/admin/documentation', label: 'Documentation' },
    ],
  },
];

export const adminGroups = groups;
export const adminLinks = adminGroups.flatMap((g) => g.links);

export function AdminSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <aside className="w-60 fixed left-0 top-header-visitor lg:top-header-chorister h-main-visitor lg:h-main-chorister border-r border-border bg-background-secondary hidden md:flex flex-col overflow-y-auto z-20">
      <div className="p-4 flex flex-col gap-5">
        <p className="text-xs font-semibold text-foreground/70 uppercase tracking-widest px-2">
          Administration
        </p>

        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-foreground/70 px-2 mb-1 uppercase tracking-wide">
              {group.label}
            </p>
            {group.links.map((link) => {
              const isActive =
                mounted &&
                (link.href === '/choristes/admin'
                  ? pathname === '/choristes/admin'
                  : pathname === link.href || pathname.startsWith(link.href + '/'));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={cn(
                    'text-sm px-3 py-1.5 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground/60 hover:text-foreground hover:bg-muted',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
