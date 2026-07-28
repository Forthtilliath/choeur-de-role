import { describe, it, expect } from 'vitest';
import { formatPhone } from '../phoneHelpers';

describe('formatPhone', () => {
  it('formate un numéro complet à 10 chiffres', () => {
    expect(formatPhone('0612345678')).toBe('06 12 34 56 78');
  });

  it('ignore les espaces existants', () => {
    expect(formatPhone('06 12 34 56 78')).toBe('06 12 34 56 78');
  });

  it('ignore les tirets', () => {
    expect(formatPhone('06-12-34-56-78')).toBe('06 12 34 56 78');
  });

  it('ignore les points', () => {
    expect(formatPhone('06.12.34.56.78')).toBe('06 12 34 56 78');
  });

  it('numéro partiel (6 chiffres) → groupes partiels sans espace final', () => {
    expect(formatPhone('061234')).toBe('06 12 34');
  });

  it('chaîne vide → chaîne vide', () => {
    expect(formatPhone('')).toBe('');
  });

  it('que des non-chiffres → chaîne vide', () => {
    expect(formatPhone('abc')).toBe('');
  });

  it('numéro international +33 (11 chiffres) → retourné brut car regex 10 chiffres max', () => {
    const result = formatPhone('+33612345678');
    expect(result).toBe('33612345678');
  });
});
