import { describe, expect, it, vi } from 'vitest';

import { lockoutMessage, normalizeEmail } from '../loginLockout';

vi.mock('@/lib/supabase.server', () => ({ createAdminClient: vi.fn() }));

describe('normalizeEmail', () => {
  it('met en minuscules et retire les espaces', () => {
    expect(normalizeEmail('  Jean.Dupont@Mail.FR ')).toBe('jean.dupont@mail.fr');
  });
});

describe('lockoutMessage', () => {
  const now = new Date('2026-10-13T12:00:00Z');

  it('arrondit à la minute supérieure', () => {
    expect(lockoutMessage(new Date('2026-10-13T12:04:10Z'), now)).toBe(
      'Trop de tentatives. Réessayez dans 5 minutes.',
    );
  });

  it('affiche au moins 1 minute, au singulier', () => {
    expect(lockoutMessage(new Date('2026-10-13T12:00:05Z'), now)).toBe(
      'Trop de tentatives. Réessayez dans 1 minute.',
    );
  });
});
