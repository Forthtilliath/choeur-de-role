import { describe, expect, it } from 'vitest';

import { generatePassword, PASSWORD_ALPHABET } from '../password';

describe('generatePassword', () => {
  it('retourne 8 caractères par défaut', () => {
    expect(generatePassword()).toHaveLength(8);
  });

  it('respecte la longueur demandée', () => {
    expect(generatePassword(12)).toHaveLength(12);
  });

  it('refuse une longueur inférieure à 8', () => {
    expect(() => generatePassword(6)).toThrow();
    expect(() => generatePassword(8.5)).toThrow();
  });

  it('est uniquement alphanumérique, sans caractères ambigus', () => {
    for (let i = 0; i < 200; i++) {
      expect(generatePassword()).toMatch(/^[a-km-np-zA-HJ-NP-Z2-9]{8}$/);
    }
    expect(PASSWORD_ALPHABET).toHaveLength(56);
    expect(PASSWORD_ALPHABET).not.toMatch(/[0O1lIo]/);
  });

  it('couvre tout l’alphabet (pas de symbole jamais tiré)', () => {
    const seen = new Set(Array.from({ length: 500 }, () => generatePassword()).join(''));
    expect(seen.size).toBe(PASSWORD_ALPHABET.length);
  });

  it('produit des mots de passe distincts', () => {
    const results = new Set(Array.from({ length: 1000 }, () => generatePassword()));
    expect(results.size).toBe(1000);
  });
});
