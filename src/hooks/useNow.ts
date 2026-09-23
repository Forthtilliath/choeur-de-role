import { useState } from 'react';

/**
 * Timestamp courant (ms), figé au montage du composant.
 *
 * `new Date()` / `Date.now()` appelés pendant le rendu renvoient une valeur
 * différente à chaque rendu (règle `purity` de React Compiler). Pour une `Date` :
 * `const now = new Date(useNow());`.
 */
export function useNow(): number {
  const [now] = useState(() => Date.now());
  return now;
}
