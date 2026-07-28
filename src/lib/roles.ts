export const MEMBER_ROLES = ['member', 'ca', 'admin', 'super_admin'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];
export type Role = MemberRole | null;

export function isValidDbRole(value: string | null | undefined): value is MemberRole {
  return MEMBER_ROLES.includes(value as MemberRole);
}

export function isAdmin(role: Role): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isCa(role: Role): boolean {
  return role === 'ca' || isAdmin(role);
}

export function isMember(role: Role): boolean {
  return role !== null;
}

// Type partagé server + client
export type RoleInfo = {
  role: Role;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isCa: boolean;
  isMember: boolean;
};

export function buildRoleInfo(role: Role): RoleInfo {
  return {
    role,
    isLoggedIn: role !== null,
    isAdmin: isAdmin(role),
    isCa: isCa(role),
    isMember: isMember(role),
  };
}
