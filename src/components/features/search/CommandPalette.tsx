'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { useRole } from '@/hooks/useRole';
import { fetchPublicSearchData, fetchMemberSearchData } from './clientQueries';

type SearchItem = {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: string;
};

const publicNavItems: SearchItem[] = [
  { id: 'nav-concerts', group: 'Pages', label: 'Concerts', href: '/concerts', icon: '🎶' },
  { id: 'nav-evenements', group: 'Pages', label: 'Événements externes', href: '/evenements', icon: '📅' },
  { id: 'nav-galerie', group: 'Pages', label: 'Galerie', href: '/galerie', icon: '🖼️' },
  { id: 'nav-partenaires', group: 'Pages', label: 'Partenaires', href: '/partenaires', icon: '🤝' },
  { id: 'nav-contact', group: 'Pages', label: 'Contact', href: '/contact', icon: '✉️' },
];

const privateNavItems: SearchItem[] = [
  { id: 'nav-actu', group: 'Espace choristes', label: 'Actualités', href: '/choristes', icon: '📰' },
  { id: 'nav-calendrier', group: 'Espace choristes', label: 'Calendrier', href: '/choristes/calendrier', icon: '📅' },
  { id: 'nav-repertoire', group: 'Espace choristes', label: 'Répertoire', href: '/choristes/repertoire', icon: '🎵' },
  { id: 'nav-liens', group: 'Espace choristes', label: 'Liens utiles', href: '/choristes/liens', icon: '🔗' },
  { id: 'nav-trombi', group: 'Espace choristes', label: 'Trombinoscope', href: '/choristes/trombinoscope', icon: '👥' },
  { id: 'nav-carte', group: 'Espace choristes', label: 'Carte', href: '/choristes/carte', icon: '🗺️' },
  { id: 'nav-ca', group: 'Espace choristes', label: 'CA', href: '/choristes/ca', icon: '📋' },
  { id: 'nav-sondages', group: 'Espace choristes', label: 'Sondages', href: '/choristes/sondages', icon: '📊' },
  { id: 'nav-profil', group: 'Espace choristes', label: 'Mon profil', href: '/choristes/profil', icon: '👤' },
];

const adminNavItems: SearchItem[] = [
  { id: 'adm-dash', group: 'Administration', label: 'Tableau de bord', href: '/choristes/admin/tableau-de-bord', icon: '📊' },
  { id: 'adm-messages', group: 'Administration', label: 'Messages de contact', href: '/choristes/admin/messages', icon: '✉️' },
  { id: 'adm-homepage', group: 'Administration', label: "Page d'accueil", href: '/choristes/admin/homepage', icon: '🏠' },
  { id: 'adm-concerts', group: 'Administration', label: 'Concerts', href: '/choristes/admin/concerts', icon: '🎭' },
  { id: 'adm-galerie', group: 'Administration', label: 'Galerie photos', href: '/choristes/admin/galerie', icon: '🖼️' },
  { id: 'adm-evenements', group: 'Administration', label: 'Événements', href: '/choristes/admin/evenements', icon: '📅' },
  { id: 'adm-sponsors', group: 'Administration', label: 'Partenaires', href: '/choristes/admin/sponsors', icon: '🤝' },
  { id: 'adm-membres', group: 'Administration', label: 'Membres', href: '/choristes/admin/membres', icon: '👥' },
  { id: 'adm-pupitres', group: 'Administration', label: 'Pupitres', href: '/choristes/admin/pupitres', icon: '🎤' },
  { id: 'adm-saisons', group: 'Administration', label: 'Saisons', href: '/choristes/admin/saisons', icon: '📆' },
  { id: 'adm-media', group: 'Administration', label: 'Médiathèque', href: '/choristes/admin/mediatheque', icon: '📁' },
  { id: 'adm-calendrier', group: 'Administration', label: 'Calendrier', href: '/choristes/admin/calendrier', icon: '📅' },
  { id: 'adm-liens', group: 'Administration', label: 'Liens utiles', href: '/choristes/admin/liens', icon: '🔗' },
  { id: 'adm-ca', group: 'Administration', label: 'Comptes-rendus CA', href: '/choristes/admin/ca', icon: '📋' },
  { id: 'adm-sondages', group: 'Administration', label: 'Sondages', href: '/choristes/admin/sondages', icon: '📊' },
  { id: 'adm-audit', group: 'Administration', label: "Journal d'audit", href: '/choristes/admin/audit-log', icon: '🔍' },
];

// Outer component — persists across opens, caches dynamic data
export function CommandPalette() {
  const { isOpen, open, close } = useCommandPalette();
  const { isMember, isAdmin, loading } = useRole();
  const [dynamicItems, setDynamicItems] = useState<SearchItem[]>([]);
  const [dynamicLoaded, setDynamicLoaded] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut + Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) close(); else open();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, open, close]);

  // Concerts + actus publiées : chargés pour tout le monde, connecté ou non.
  // Choristes/chants/calendrier : uniquement pour les membres (données internes).
  useEffect(() => {
    if (!isOpen || dynamicLoaded || loading) return;

    async function fetchDynamic() {
      const [{ performances, news }, memberData] = await Promise.all([
        fetchPublicSearchData(),
        isMember ? fetchMemberSearchData() : Promise.resolve(null),
      ]);

      const items: SearchItem[] = [];

      performances.forEach((p) => {
        items.push({
          id: `p-${p.id}`,
          group: 'Concerts',
          label: p.title,
          href: `/concerts/${p.slug ?? ''}`,
          icon: '🎭',
        });
      });

      news.forEach((n) => {
        items.push({
          id: `n-${n.id}`,
          group: 'Actualités',
          label: n.title,
          href: `/choristes#news-${n.id}`,
          icon: '📰',
        });
      });

      if (memberData) {
        memberData.members.forEach((m) => {
          const name = `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim();
          if (!name) return;
          const vp = (m.voice_parts as { name: string } | null)?.name;
          items.push({
            id: `m-${m.id}`,
            group: 'Choristes',
            label: name,
            sublabel: vp,
            href: '/choristes/trombinoscope',
            icon: '👤',
          });
        });

        memberData.songs.forEach((s) => {
          items.push({
            id: `s-${s.id}`,
            group: 'Chants',
            label: s.title,
            href: `/choristes/repertoire/${s.id}`,
            icon: '🎵',
          });
        });

        memberData.events.forEach((e) => {
          const date = new Date(e.starts_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });
          items.push({
            id: `ev-${e.id}`,
            group: 'Calendrier',
            label: e.title,
            sublabel: date,
            href: `/choristes/calendrier/${e.id}`,
            icon: '📅',
          });
        });
      }

      setDynamicItems(items);
      setDynamicLoaded(true);
    }
    fetchDynamic();
  }, [isOpen, dynamicLoaded, loading, isMember]);

  if (!isOpen) return null;

  const navItems = [
    ...publicNavItems,
    ...(isMember ? privateNavItems : []),
    ...(isAdmin ? adminNavItems : []),
  ];

  return (
    // CommandPaletteInner remounts on each open → query/activeIndex always start fresh
    <CommandPaletteInner
      navItems={navItems}
      dynamicItems={dynamicItems}
      onClose={close}
    />
  );
}

// Inner component — remounts on each open, no setState-in-effect needed
function CommandPaletteInner({
  navItems,
  dynamicItems,
  onClose,
}: {
  navItems: SearchItem[];
  dynamicItems: SearchItem[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus on mount (no setState, safe)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce: update debouncedQuery 400ms after query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setActiveIndex(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const q = debouncedQuery.trim().toLowerCase();
  const allItems = [...navItems, ...dynamicItems];
  const filtered = q
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.sublabel?.toLowerCase().includes(q),
      )
    : [];

  const groups = filtered.reduce<Record<string, SearchItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});
  const flat = Object.values(groups).flat();

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        if (flat[activeIndex]) {
          onClose();
          router.push(flat[activeIndex].href);
        }
        break;
    }
  }

  const hasResults = q && flat.length > 0;
  const hasNoResults = q && flat.length === 0;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl mx-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4">
          <Search size={16} className="text-foreground/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un choriste, un chant, une actualité..."
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/40 py-4"
          />
          <kbd className="text-xs text-foreground/30 border border-border rounded px-1.5 py-0.5 shrink-0">
            Esc
          </kbd>
        </div>

        {/* Results — only when query is set */}
        {(hasResults || hasNoResults) && (
          <>
            <div className="border-t border-border max-h-96 overflow-y-auto py-2">
              {hasNoResults && (
                <p className="text-sm text-foreground/40 text-center py-10">
                  Aucun résultat pour &quot;{debouncedQuery}&quot;
                </p>
              )}
              {hasResults && Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40 px-4 pt-3 pb-1">
                    {group}
                  </p>
                  {items.map((item) => {
                    const idx = flat.indexOf(item);
                    const isActive = idx === activeIndex;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onClose}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary-light'
                            : 'text-foreground hover:bg-background-secondary'
                        }`}
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block truncate">{item.label}</span>
                          {item.sublabel && (
                            <span className="block truncate text-xs text-foreground/50">
                              {item.sublabel}
                            </span>
                          )}
                        </span>
                        {isActive && (
                          <kbd className="text-xs text-foreground/30 border border-border rounded px-1.5 py-0.5 shrink-0">
                            ↵
                          </kbd>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            {hasResults && (
              <div className="px-4 py-2 border-t border-border flex gap-4 text-xs text-foreground/30">
                <span>
                  <kbd className="border border-border rounded px-1 py-0.5">↑↓</kbd> naviguer
                </span>
                <span>
                  <kbd className="border border-border rounded px-1 py-0.5">↵</kbd> ouvrir
                </span>
                <span>
                  <kbd className="border border-border rounded px-1 py-0.5">Esc</kbd> fermer
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
