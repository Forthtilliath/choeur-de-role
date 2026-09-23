/**
 * Copie de `items` où les éléments aux positions `i` et `j` sont échangés.
 * Renvoie une simple copie si l'une des positions est hors limites.
 */
export function swapItems<T>(items: readonly T[], i: number, j: number): T[] {
  const next = [...items];
  const a = next[i];
  const b = next[j];
  if (a === undefined || b === undefined) return next;
  next[i] = b;
  next[j] = a;
  return next;
}
