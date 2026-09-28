'use client';

import { useEffect, useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { AuthButton } from '@/components/layout/AuthButton';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { useRole } from '@/hooks/useRole';

import { ChoristesSubNav } from './ChoristesSubNav';
import { publicLinks } from './headerLinks';
import { MobileMenu } from './MobileMenu';
export function Header({
  initialLoggedIn,
  pendingPollsCount = 0,
}: {
  initialLoggedIn?: boolean;
  pendingPollsCount?: number;
}) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const { isMember, isAdmin, isCa } = useRole();
  const { open: openSearch } = useCommandPalette();
  const headerChoristerVisible = isMember;

  useEffect(() => {
    document.body.style.overflow = menuOuvert ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOuvert]);

  function navigate(href: string) {
    setMenuOuvert(false);
    if (href !== pathname) {
      startTransition(() => {
        router.push(href);
      });
    }
  }

  return (
    <>
      {/* Barre de progression navigation */}
      {isPending && (
        <div className="fixed top-0 left-0 right-0 z-9999 h-1 bg-primary/20 overflow-hidden">
          <div
            className="absolute inset-y-0 w-1/2 bg-linear-to-r from-primary via-secondary to-primary"
            style={{ animation: 'nav-progress 1s ease-in-out infinite' }}
          />
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background-secondary/90 backdrop-blur-md">
        {/* Filet doré : l'anneau du logo */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-secondary-dark via-secondary to-secondary-dark"
        />
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setMenuOuvert(false)}
            className="group flex items-center gap-3 no-underline"
          >
            <Image
              src="/images/logo.svg"
              alt="Chœur de Rôle"
              loading="eager"
              unoptimized
              width={48}
              height={48}
              className="size-12 transition-transform duration-300 group-hover:-rotate-12"
            />
            <span className="hidden sm:flex flex-col leading-none">
              <span className="font-display text-lg font-semibold text-foreground">
                Chœur de Rôle
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-secondary-dark dark:text-secondary">
                Chorale à Angers
              </span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {publicLinks.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className={`text-sm transition-colors px-3 py-1.5 rounded-lg ${pathname === lien.href ? 'nav-marker text-primary-light font-semibold' : 'text-foreground/70 hover:text-foreground hover:bg-muted'}`}
              >
                {lien.label}
              </Link>
            ))}
          </nav>

          {/* Desktop: search icon + auth */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={openSearch}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-background-tertiary transition-colors"
              aria-label="Recherche globale (⌘K)"
            >
              <Search size={18} />
            </button>
            <AuthButton initialLoggedIn={initialLoggedIn} />
          </div>

          {/* Mobile: search icon + burger */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={openSearch}
              className="p-2 text-foreground/60 hover:text-foreground transition-colors"
              aria-label="Recherche"
            >
              <Search size={18} />
            </button>
            <button
              className="flex flex-col gap-1.5 p-2"
              onClick={() => setMenuOuvert(!menuOuvert)}
              aria-label="Menu"
            >
              <span
                className={`bg-foreground block w-6 h-0.5 transition-transform ${menuOuvert ? 'rotate-45 translate-y-2' : ''}`}
              />
              <span
                className={`bg-foreground block w-6 h-0.5 transition-opacity ${menuOuvert ? 'opacity-0' : ''}`}
              />
              <span
                className={`bg-foreground block w-6 h-0.5 transition-transform ${menuOuvert ? '-rotate-45 -translate-y-2' : ''}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Spacers pour le header fixed */}
      <div className="h-16" aria-hidden="true" />
      {headerChoristerVisible && <div className="hidden lg:block h-10" aria-hidden="true" />}

      {menuOuvert && (
        <MobileMenu
          pathname={pathname}
          isMember={isMember}
          isCa={isCa}
          isAdmin={isAdmin}
          pendingPollsCount={pendingPollsCount}
          initialLoggedIn={initialLoggedIn}
          onNavigateAction={navigate}
          onCloseAction={() => setMenuOuvert(false)}
        />
      )}

      {headerChoristerVisible && (
        <ChoristesSubNav
          pathname={pathname}
          isCa={isCa}
          isAdmin={isAdmin}
          pendingPollsCount={pendingPollsCount}
        />
      )}
    </>
  );
}
