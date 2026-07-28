import { describe, it, expect } from 'vitest';
import { generatePassphrase } from '../passphrase';
import { wordlist } from '../wordlist';

describe('generatePassphrase', () => {
  it('retourne 4 mots par défaut', () => {
    const parts = generatePassphrase().split('-');
    expect(parts).toHaveLength(4);
  });

  it('retourne le bon nombre de mots selon le paramètre', () => {
    expect(generatePassphrase(3).split('-')).toHaveLength(3);
    expect(generatePassphrase(6).split('-')).toHaveLength(6);
  });

  it('tous les mots proviennent de la wordlist', () => {
    const parts = generatePassphrase(4).split('-');
    for (const word of parts) {
      expect(wordlist).toContain(word);
    }
  });

  it('les mots sont séparés par des tirets, aucun mot vide', () => {
    const parts = generatePassphrase(4).split('-');
    expect(parts).toHaveLength(4);
    for (const word of parts) {
      expect(word.length).toBeGreaterThan(0);
    }
  });

  it('deux appels successifs produisent des résultats différents (proba élevée)', () => {
    const results = new Set(Array.from({ length: 5 }, () => generatePassphrase()));
    expect(results.size).toBeGreaterThan(1);
  });
});
