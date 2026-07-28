// utils/arrayHelpers.ts

// Filtre un tableau selon une condition donnée par une fonction
export function filterBy<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

// Trie un tableau selon une clé ou une valeur retournée par une fonction
export function sortBy<T>(array: T[], selector: (item: T) => number, descending = false): T[] {
  const sorted = [...array].sort((a, b) => {
    const aVal = selector(a);
    const bVal = selector(b);
    return descending ? bVal - aVal : aVal - bVal;
  });
  return sorted;
}

export function sortByOrderIndex<T extends { order_index?: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
}

// Récupère la date la plus petite dans un tableau d'objets avec une propriété date
export function getMinDate<T>(array: T[], dateSelector: (item: T) => Date): Date | null {
  if (array.length === 0) return null;
  return new Date(Math.min(...array.map((d) => dateSelector(d).getTime())));
}

// Récupère la date la plus grande dans un tableau d'objets avec une propriété date
export function getMaxDate<T>(array: T[], dateSelector: (item: T) => Date): Date | null {
  if (array.length === 0) return null;
  return new Date(Math.max(...array.map((d) => dateSelector(d).getTime())));
}
