'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useNow } from '@/hooks/useNow';

const FOOTER_LINKS = [
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/cgu', label: 'CGU' },
  { href: '/politique-confidentialite', label: 'Confidentialité' },
  { href: '/contact', label: 'Contact' },
];

// Pied de page « tapis de jeu » : toujours sombre, en clair comme en sombre
export function Footer() {
  const year = new Date(useNow()).getFullYear();
  const pathname = usePathname();

  if (pathname === '/choristes/carte') return null;

  const isAdmin = pathname.startsWith('/choristes/admin');

  return (
    <footer className={`relative bg-felt mt-auto${isAdmin ? ' md:pl-52' : ''}`}>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-secondary-dark via-secondary to-secondary-dark"
      />
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Image
              src="/images/logo.svg"
              alt=""
              unoptimized
              width={56}
              height={56}
              className="size-14"
            />
            <div>
              <p className="font-display text-xl font-semibold text-felt-foreground">
                Chœur de Rôle
              </p>
              <p className="font-display italic text-sm text-felt-foreground/70 max-w-xs">
                « Ici, on joue collectif, sur scène comme autour d&apos;un plateau. »
              </p>
            </div>
          </div>
          <nav
            aria-label="Pied de page"
            className="flex flex-wrap justify-center gap-x-6 gap-y-2"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-felt-foreground/70 hover:text-secondary transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="bg-staff text-secondary/25" aria-hidden="true" />
        <p className="text-xs text-felt-foreground/60 text-center">
          © {year} Chœur de Rôle — Association loi 1901
        </p>
      </div>
    </footer>
  );
}
