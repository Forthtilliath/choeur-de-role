import { useCallback, useState } from 'react';

import type { NameFormat, SortDir, SortKey } from './membersList';

// Tri cyclique par colonne (asc → desc → défaut) et format d'affichage des noms
export function useMemberSort() {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('default');
  const [nameFormat, setNameFormat] = useState<NameFormat>('first_last');

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir('asc');
        return key;
      }
      setSortDir((d) => (d === 'default' ? 'asc' : d === 'asc' ? 'desc' : 'default'));
      return key;
    });
  }, []);

  const toggleNameFormat = useCallback(() => {
    setNameFormat((f) => (f === 'first_last' ? 'last_first' : 'first_last'));
  }, []);

  return { sortKey, sortDir, nameFormat, handleSort, toggleNameFormat };
}
