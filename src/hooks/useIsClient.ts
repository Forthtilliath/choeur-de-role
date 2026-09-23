import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * `false` au rendu serveur et pendant l'hydratation, `true` ensuite côté client.
 * Remplace le motif `useEffect(() => setMounted(true), [])` sans rendu supplémentaire.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
