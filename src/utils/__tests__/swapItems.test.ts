import { describe, expect, it } from 'vitest';

import { swapItems } from '../swapItems';

describe('swapItems', () => {
  it('échange deux éléments sans modifier le tableau source', () => {
    const items = ['a', 'b', 'c'];
    expect(swapItems(items, 0, 2)).toEqual(['c', 'b', 'a']);
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('renvoie une copie inchangée si une position est hors limites', () => {
    const items = ['a', 'b'];
    const result = swapItems(items, 1, 2);
    expect(result).toEqual(['a', 'b']);
    expect(result).not.toBe(items);
    expect(swapItems(items, -1, 0)).toEqual(['a', 'b']);
  });
});
