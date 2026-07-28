import { describe, it, expect } from 'vitest';
import { toUpperCase, toTitleCase, escapeHtml } from '../stringHelpers';

describe('toUpperCase', () => {
  it('met en majuscules', () => expect(toUpperCase('hello')).toBe('HELLO'));
  it('null → chaîne vide', () => expect(toUpperCase(null)).toBe(''));
  it('undefined → chaîne vide', () => expect(toUpperCase(undefined)).toBe(''));
  it('chaîne déjà en majuscules → inchangée', () => expect(toUpperCase('ABC')).toBe('ABC'));
});

describe('toTitleCase', () => {
  it('capitalise le premier mot', () => expect(toTitleCase('bonjour')).toBe('Bonjour'));
  it('capitalise chaque mot séparé par un espace', () => {
    expect(toTitleCase('jean dupont')).toBe('Jean Dupont');
  });
  it('capitalise après un tiret (noms composés)', () => {
    expect(toTitleCase('marie-claire')).toBe('Marie-Claire');
  });
  it("capitalise après une apostrophe (noms d'origine)", () => {
    expect(toTitleCase("d'alembert")).toBe("D'Alembert");
  });
  it('null → chaîne vide', () => expect(toTitleCase(null)).toBe(''));
  it('undefined → chaîne vide', () => expect(toTitleCase(undefined)).toBe(''));
});

describe('escapeHtml', () => {
  it('échappe &', () => expect(escapeHtml('a & b')).toBe('a &amp; b'));
  it('échappe <', () => expect(escapeHtml('<script>')).toBe('&lt;script&gt;'));
  it('échappe >', () => expect(escapeHtml('a > b')).toBe('a &gt; b'));
  it('échappe les guillemets doubles', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });
  it("échappe les guillemets simples (prévention XSS)", () => {
    expect(escapeHtml("it's")).toBe("it&#x27;s");
  });
  it('chaîne sans caractères spéciaux → inchangée', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
  it('null → chaîne vide', () => expect(escapeHtml(null)).toBe(''));
  it('undefined → chaîne vide', () => expect(escapeHtml(undefined)).toBe(''));
  it('attaque XSS complète est neutralisée', () => {
    const result = escapeHtml('<img src=x onerror="alert(1)">');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('"');
  });
});
