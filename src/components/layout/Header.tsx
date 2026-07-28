'use client';

import { useTransition, useState, useEffect } from 'react';
import { Search, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { adminGroups } from '@/components/layout/AdminSidebar';
import { AuthButton } from '@/components/layout/AuthButton';
import { Button } from '@/components/ui/Button';
import { useRole } from '@/hooks/useRole';
import { useCommandPalette } from '@/context/CommandPaletteContext';

const publicLinks = [
  { href: '/concerts', label: 'Concerts', icon: '🎶' },
  { href: '/evenements', label: 'Évènements externes', icon: '📅' },
  { href: '/galerie', label: 'Galerie', icon: '🖼️' },
  { href: '/partenaires', label: 'Partenaires', icon: '🤝' },
  { href: '/contact', label: 'Contact', icon: '✉️' },
];

const privateLinks = [
  { href: '/choristes', label: 'Actualités', icon: '📰' },
  { href: '/choristes/calendrier', label: 'Calendrier', icon: '📅' },
  { href: '/choristes/repertoire', label: 'Répertoire', icon: '🎵' },
  { href: '/choristes/liens', label: 'Liens utiles', icon: '🔗' },
  { href: '/choristes/trombinoscope', label: 'Trombinoscope', icon: '👥' },
  { href: '/choristes/carte', label: 'Carte', icon: '🗺️' },
  { href: '/choristes/ca', label: 'CA', icon: '📋' },
  { href: '/choristes/sondages', label: 'Sondages', icon: '📊' },
  { href: '/choristes/profil', label: 'Mon profil', icon: '👤' },
];

const adminIcons: Record<string, string> = {
  '/choristes/admin/tableau-de-bord': '📊',
  '/choristes/admin/messages': '✉️',
  '/choristes/admin/audit-log': '🔍',
  '/choristes/admin/homepage': '🏠',
  '/choristes/admin/concerts': '🎭',
  '/choristes/admin/galerie': '🖼️',
  '/choristes/admin/evenements': '📅',
  '/choristes/admin/sponsors': '🤝',
  '/choristes/admin': '📰',
  '/choristes/admin/calendrier': '📅',
  '/choristes/admin/membres': '👥',
  '/choristes/admin/pupitres': '🎤',
  '/choristes/admin/saisons': '📆',
  '/choristes/admin/mediatheque': '📁',
  '/choristes/admin/liens': '🔗',
  '/choristes/admin/ca': '📋',
  '/choristes/admin/sondages': '📊',
  '/choristes/admin/emails': '📧',
  '/choristes/admin/mentions-legales': '⚖️',
  '/choristes/admin/documentation': '📖',
  '/choristes/admin/bureau/projets': '📌',
  '/choristes/admin/bureau/templates': '🗂️',
};

export function Header({
  initialLoggedIn,
  pendingPollsCount = 0,
}: {
  initialLoggedIn?: boolean;
  pendingPollsCount?: number;
}) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [showAdminLinks, setShowAdminLinks] = useState(false);
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
            className="absolute inset-y-0 w-1/2 bg-primary"
            style={{ animation: 'nav-progress 1s ease-in-out infinite' }}
          />
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background-secondary">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" onClick={() => setMenuOuvert(false)} className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Chœur de Rôle"
              loading="eager"
              width={84}
              height={56}
              className="object-contain w-auto h-14"
            />
            <span className="text-foreground font-medium text-sm hidden sm:block">
              Chœur de Rôle
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {publicLinks.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                className={`text-sm transition-all px-3 py-1.5 rounded-md ${pathname === lien.href ? 'text-primary-light bg-primary/10 dark:bg-primary/20 font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-muted'}`}
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
              <span className={`bg-foreground block w-6 h-0.5 transition-transform ${menuOuvert ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`bg-foreground block w-6 h-0.5 transition-opacity ${menuOuvert ? 'opacity-0' : ''}`} />
              <span className={`bg-foreground block w-6 h-0.5 transition-transform ${menuOuvert ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Spacers pour le header fixed */}
      <div className="h-16" aria-hidden="true" />
      {headerChoristerVisible && <div className="hidden lg:block h-10" aria-hidden="true" />}

      {/* Menu mobile/tablette — style palette */}
      {menuOuvert && (
        <nav className="fixed inset-0 z-40 lg:hidden bg-background-secondary px-2 pt-20 pb-4 flex flex-col overflow-y-auto overscroll-contain">

          {/* Accueil */}
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${pathname === '/' ? 'bg-primary/10 text-primary-light font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-background-tertiary'}`}
          >
            <span className="text-base shrink-0">🏠</span>
            <span>Accueil</span>
          </button>

          {/* Liens publics */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 px-3 pt-4 pb-1">
            Découvrir
          </p>
          {publicLinks.map((lien) => (
            <button
              key={lien.href}
              onClick={() => navigate(lien.href)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${pathname === lien.href ? 'bg-primary/10 text-primary-light font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-background-tertiary'}`}
            >
              <span className="text-base shrink-0">{lien.icon}</span>
              <span>{lien.label}</span>
            </button>
          ))}

          {/* Espace choristes */}
          {isMember && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 px-3 pt-4 pb-1">
                Espace choristes
              </p>
              {privateLinks.map((lien) => (
                <button
                  key={lien.href}
                  onClick={() => navigate(lien.href)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${pathname === lien.href ? 'bg-primary/10 text-primary-light font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-background-tertiary'}`}
                >
                  <span className="text-base shrink-0">{lien.icon}</span>
                  <span className="flex items-center gap-1.5">
                    {lien.label}
                    {lien.href === '/choristes/sondages' && pendingPollsCount > 0 && (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-primary text-white font-bold text-[10px]">
                        {pendingPollsCount}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </>
          )}

          {/* Bureau CA */}
          {isCa && (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 px-3 pt-4 pb-1">
                Bureau
              </p>
              <button
                onClick={() => navigate('/choristes/bureau/taches')}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${pathname.startsWith('/choristes/bureau') ? 'bg-primary/10 text-primary-light font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-background-tertiary'}`}
              >
                <span className="text-base shrink-0">📌</span>
                <span>Tâches</span>
              </button>
            </>
          )}

          {/* Administration */}
          {isAdmin && (
            <>
              <button
                onClick={() => setShowAdminLinks((v) => !v)}
                className="flex items-center justify-between w-full px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                <span>Administration</span>
                <span>{showAdminLinks ? '▲' : '▼'}</span>
              </button>
              {showAdminLinks && (adminGroups ?? []).map((group) => (
                <div key={group.label}>
                  <p className="text-[10px] text-foreground/30 px-3 pt-2 pb-1 italic">
                    {group.label}
                  </p>
                  {group.links.map((lien) => {
                    const isActive =
                      lien.href === '/choristes/admin'
                        ? pathname === '/choristes/admin'
                        : pathname.startsWith(lien.href);
                    return (
                      <button
                        key={lien.href}
                        onClick={() => navigate(lien.href)}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-secondary/10 text-secondary font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-background-tertiary'}`}
                      >
                        <span className="text-base shrink-0">{adminIcons[lien.href] ?? '•'}</span>
                        <span>{lien.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </>
          )}

          {/* Auth */}
          <div className="border-t border-border mt-4 pt-3 px-1">
            <AuthButton
              onClickAction={() => setMenuOuvert(false)}
              initialLoggedIn={initialLoggedIn}
            />
          </div>
        </nav>
      )}

      {/* Sous-menu choristes desktop */}
      {headerChoristerVisible && (
        <div className="hidden lg:flex fixed top-16 left-0 right-0 z-40 bg-background-tertiary border-b border-border">
          <div
            className={`max-w-5xl mx-auto px-4 h-10 flex items-center w-full ${isAdmin ? 'justify-between' : 'justify-center'}`}
          >
            <nav className="flex items-center gap-1">
              {privateLinks.map((lien) => (
                <span className="relative" key={lien.href}>
                  <Link
                    href={lien.href}
                    prefetch={false}
                    className={`text-xs transition-all px-3 py-1 rounded-md whitespace-nowrap ${pathname === lien.href ? 'text-primary-light bg-primary/10 dark:bg-primary/20 font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-background'}`}
                  >
                    {lien.label}
                    {lien.href === '/choristes/sondages' && pendingPollsCount > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex size-3 z-51">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex size-3 rounded-full bg-primary justify-center items-center text-black text-[10px] font-bold">
                          {pendingPollsCount}
                        </span>
                      </span>
                    )}
                  </Link>
                </span>
              ))}
            </nav>
            {isCa && (
              <Link
                href="/choristes/bureau/taches"
                prefetch={false}
                className={`text-xs transition-all px-3 py-1 rounded-md whitespace-nowrap ${pathname.startsWith('/choristes/bureau') ? 'text-primary-light bg-primary/10 dark:bg-primary/20 font-medium' : 'text-foreground/70 hover:text-foreground hover:bg-background'}`}
              >
                Tâches
              </Link>
            )}
            {isAdmin && (
              <Button
                href="/choristes/admin/tableau-de-bord"
                variant={pathname.startsWith('/choristes/admin') ? 'secondary' : 'outline-secondary'}
                size="sm"
                className="flex gap-1 group"
              >
                <Settings
                  size={14}
                  className={`[animation-duration:3s]! ${pathname.startsWith('/choristes/admin') ? 'animate-spin' : 'group-hover:animate-spin'}`}
                />
                Administration
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
