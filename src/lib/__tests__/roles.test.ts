import { describe, it, expect } from 'vitest';
import { isValidDbRole, isAdmin, isCa, isMember, buildRoleInfo } from '../roles';

describe('isValidDbRole', () => {
  it.each(['member', 'ca', 'admin', 'super_admin'])('accepte le rôle valide "%s"', (role) => {
    expect(isValidDbRole(role)).toBe(true);
  });

  it.each([null, undefined, '', 'superadmin', 'ADMIN', 'guest'])(
    'rejette la valeur invalide %s',
    (value) => {
      expect(isValidDbRole(value as string)).toBe(false);
    },
  );
});

describe('isAdmin', () => {
  it('retourne true pour admin', () => expect(isAdmin('admin')).toBe(true));
  it('retourne true pour super_admin', () => expect(isAdmin('super_admin')).toBe(true));
  it('retourne false pour ca', () => expect(isAdmin('ca')).toBe(false));
  it('retourne false pour member', () => expect(isAdmin('member')).toBe(false));
  it('retourne false pour null', () => expect(isAdmin(null)).toBe(false));
});

describe('isCa', () => {
  it('retourne true pour ca', () => expect(isCa('ca')).toBe(true));
  it('retourne true pour admin (admin ⊇ ca)', () => expect(isCa('admin')).toBe(true));
  it('retourne true pour super_admin', () => expect(isCa('super_admin')).toBe(true));
  it('retourne false pour member', () => expect(isCa('member')).toBe(false));
  it('retourne false pour null', () => expect(isCa(null)).toBe(false));
});

describe('isMember', () => {
  it.each(['member', 'ca', 'admin', 'super_admin'])('retourne true pour "%s"', (role) => {
    expect(isMember(role as Parameters<typeof isMember>[0])).toBe(true);
  });
  it('retourne false pour null', () => expect(isMember(null)).toBe(false));
});

describe('buildRoleInfo', () => {
  it('null → utilisateur déconnecté', () => {
    const info = buildRoleInfo(null);
    expect(info).toEqual({
      role: null,
      isLoggedIn: false,
      isAdmin: false,
      isCa: false,
      isMember: false,
    });
  });

  it('member → choriste connecté sans privilèges', () => {
    const info = buildRoleInfo('member');
    expect(info).toMatchObject({ role: 'member', isLoggedIn: true, isAdmin: false, isCa: false, isMember: true });
  });

  it('ca → accès CA mais pas admin', () => {
    const info = buildRoleInfo('ca');
    expect(info).toMatchObject({ isLoggedIn: true, isAdmin: false, isCa: true, isMember: true });
  });

  it('admin → accès total', () => {
    const info = buildRoleInfo('admin');
    expect(info).toMatchObject({ isLoggedIn: true, isAdmin: true, isCa: true, isMember: true });
  });

  it('super_admin → accès total', () => {
    const info = buildRoleInfo('super_admin');
    expect(info).toMatchObject({ isLoggedIn: true, isAdmin: true, isCa: true, isMember: true });
  });
});
