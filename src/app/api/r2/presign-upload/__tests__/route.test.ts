import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/r2', () => ({
  r2: {},
  R2_IMAGES_BUCKET: 'test-bucket',
  R2_PUBLIC_URL: 'https://cdn.example.com',
}));

vi.mock('@/lib/auth', () => ({
  getUserQuery: vi.fn(),
}));

import { isValidKey } from '../route';

const ADMIN = true;
const NOT_ADMIN = false;
const USER = 'user-abc123';

describe('isValidKey', () => {
  // ── Photo de profil ─────────────────────────────────────────────
  it('autorise sa propre photo de profil', () => {
    expect(isValidKey(`members/${USER}.webp`, USER, NOT_ADMIN)).toBe(true);
  });

  it("refuse la photo de profil d'un autre utilisateur (non-admin)", () => {
    expect(isValidKey('members/other-user.webp', USER, NOT_ADMIN)).toBe(false);
  });

  it("autorise la photo de profil d'un autre utilisateur pour un admin", () => {
    expect(isValidKey('members/other-user.webp', USER, ADMIN)).toBe(true);
  });

  // ── Préfixes admin ───────────────────────────────────────────────
  it.each(['home/', 'gallery/', 'concerts/', 'events/', 'editor/'])(
    'autorise le prefixe %s pour un admin',
    (prefix) => {
      expect(isValidKey(`${prefix}image.webp`, USER, ADMIN)).toBe(true);
    },
  );

  it.each(['home/', 'gallery/', 'concerts/', 'events/', 'editor/'])(
    'refuse le prefixe %s pour un non-admin',
    (prefix) => {
      expect(isValidKey(`${prefix}image.webp`, USER, NOT_ADMIN)).toBe(false);
    },
  );

  // ── Sécurité ─────────────────────────────────────────────────────
  it('bloque la traversee de repertoire avec ..', () => {
    expect(isValidKey('members/../etc/passwd', USER, ADMIN)).toBe(false);
    expect(isValidKey('../home/hero.webp', USER, ADMIN)).toBe(false);
  });

  it('bloque les chemins absolus', () => {
    expect(isValidKey('/home/hero.webp', USER, ADMIN)).toBe(false);
  });

  it('bloque les null bytes', () => {
    expect(isValidKey('home/he\0ro.webp', USER, ADMIN)).toBe(false);
  });

  it('bloque une cle vide', () => {
    expect(isValidKey('', USER, ADMIN)).toBe(false);
  });

  // ── Clés arbitraires ─────────────────────────────────────────────
  it('refuse une cle arbitraire meme pour un admin', () => {
    expect(isValidKey('songs/secret.mp3', USER, ADMIN)).toBe(false);
  });

  it('refuse une cle arbitraire pour un non-admin', () => {
    expect(isValidKey('songs/secret.mp3', USER, NOT_ADMIN)).toBe(false);
  });
});
