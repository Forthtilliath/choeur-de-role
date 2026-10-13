import { describe, expect, it } from 'vitest';

import { generatePassword, PASSWORD_WORD_COUNT, PASSWORD_WORDS } from '../password';

describe('PASSWORD_WORDS', () => {
  it('contient 6 000 mots uniques', () => {
    expect(PASSWORD_WORDS).toHaveLength(6000);
    expect(new Set(PASSWORD_WORDS).size).toBe(PASSWORD_WORDS.length);
  });

  it('ne contient que des mots de 6 à 8 lettres minuscules sans accent', () => {
    for (const word of PASSWORD_WORDS) {
      expect(word).toMatch(/^[a-z]{6,8}$/);
    }
  });
});

describe('generatePassword', () => {
  it('retourne 4 mots de la liste séparés par des tirets', () => {
    for (let i = 0; i < 200; i++) {
      const parts = generatePassword().split('-');
      expect(parts).toHaveLength(PASSWORD_WORD_COUNT);
      for (const word of parts) {
        expect(PASSWORD_WORDS).toContain(word);
      }
    }
  });

  it('produit des mots de passe distincts', () => {
    const results = new Set(Array.from({ length: 1000 }, () => generatePassword()));
    expect(results.size).toBe(1000);
  });

  it('tire les mots dans toute la liste, pas seulement en début', () => {
    const indexes = Array.from({ length: 500 }, () => generatePassword().split('-'))
      .flat()
      .map((word) => PASSWORD_WORDS.indexOf(word));
    expect(Math.max(...indexes)).toBeGreaterThan(PASSWORD_WORDS.length * 0.9);
    expect(Math.min(...indexes)).toBeLessThan(PASSWORD_WORDS.length * 0.1);
  });
});
