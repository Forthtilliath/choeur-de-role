'use client';

import { useEffect, useState } from 'react';

import { useCommandPalette } from '@/context/CommandPaletteContext';
import { useRole } from '@/hooks/useRole';

import { buildDynamicSearchItems } from './buildDynamicSearchItems';
import { fetchMemberSearchData, fetchPublicSearchData } from './clientQueries';
import { CommandPaletteInner } from './CommandPaletteInner';
import type { SearchItem } from './navSearchItems';
import { adminNavItems, privateNavItems, publicNavItems } from './navSearchItems';
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
        if (isOpen) close();
        else open();
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
      const [publicData, memberData] = await Promise.all([
        fetchPublicSearchData(),
        isMember ? fetchMemberSearchData() : Promise.resolve(null),
      ]);

      setDynamicItems(buildDynamicSearchItems(publicData, memberData));
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
    <CommandPaletteInner navItems={navItems} dynamicItems={dynamicItems} onClose={close} />
  );
}
