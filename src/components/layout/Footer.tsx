'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname === '/choristes/carte') return null;

  const isAdmin = pathname.startsWith('/choristes/admin');

  return (
    <footer className={`border-t border-border bg-background mt-auto${isAdmin ? ' md:pl-52' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-foreground/70">
          © {new Date().getFullYear()} Chœur de Rôle — Association loi 1901
        </p>
        <div className="flex gap-6">
          <Link
            href="/mentions-legales"
            className="text-xs text-foreground/70 hover:text-foreground transition-colors no-underline"
          >
            Mentions légales
          </Link>
          <Link
            href="/cgu"
            className="text-xs text-foreground/70 hover:text-foreground transition-colors no-underline"
          >
            CGU
          </Link>
          <Link
            href="/politique-confidentialite"
            className="text-xs text-foreground/70 hover:text-foreground transition-colors no-underline"
          >
            Confidentialité
          </Link>
          <Link
            href="/contact"
            className="text-xs text-foreground/70 hover:text-foreground transition-colors no-underline"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
