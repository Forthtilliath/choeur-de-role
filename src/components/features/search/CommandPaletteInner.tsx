'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { SearchItem } from './navSearchItems';

// Inner component — remounts on each open, no setState-in-effect needed
export function CommandPaletteInner({
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
        (item) => item.label.toLowerCase().includes(q) || item.sublabel?.toLowerCase().includes(q),
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
    // Backdrop click-to-dismiss — Escape (géré plus haut) est l'équivalent clavier.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      {/* Contient le clic pour éviter la fermeture au clic dans la palette */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
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
              {hasResults &&
                Object.entries(groups).map(([group, items]) => (
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
