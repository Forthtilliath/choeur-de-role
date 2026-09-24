import type { AdminMemberWithSeasons, AuthInfo } from '../types';

export type SortKey = 'last_name' | 'voice_part' | 'role' | 'updated' | 'birthday';
export type SortDir = 'default' | 'asc' | 'desc';
export type NameFormat = 'first_last' | 'last_first';

export const ROLE_GROUPS = [
  {
    key: 'membre',
    label: 'Membre',
    roles: ['member'] as string[],
    active: 'bg-foreground/15 text-foreground',
    inactive: 'bg-background-secondary text-foreground/30',
  },
  {
    key: 'ca',
    label: 'CA',
    roles: ['ca', 'admin', 'super_admin'] as string[],
    active: 'bg-secondary text-white',
    inactive: 'bg-background-secondary text-foreground/30',
  },
] as const;

export type MemberFilters = {
  search: string;
  voicePartIds: Set<string>;
  seasonId: string;
  showLocked: boolean;
  roleGroups: Set<string>;
};

export function filterMembers(
  members: AdminMemberWithSeasons[],
  filters: MemberFilters,
  authMap: Record<string, AuthInfo>,
) {
  const search = filters.search.toLowerCase();
  return members.filter((m) => {
    const matchSearch =
      search === '' || `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(search);
    const matchPart = !m.voice_part_id || filters.voicePartIds.has(m.voice_part_id);
    const matchSeason =
      !filters.seasonId || m.member_season.some((ms) => ms.season_id === filters.seasonId);
    const isLocked = authMap[m.id]?.isLocked ?? false;
    const matchLocked = filters.showLocked || !isLocked;
    const memberRole = m.role ?? 'member';
    const matchRole = ROLE_GROUPS.some(
      (g) => filters.roleGroups.has(g.key) && (g.roles as string[]).includes(memberRole),
    );
    return matchSearch && matchPart && matchSeason && matchLocked && matchRole;
  });
}

const ROLE_RANK: Record<string, number> = { member: 0, ca: 1, admin: 2, super_admin: 3 };

function compareNames(a: AdminMemberWithSeasons, b: AdminMemberWithSeasons, lastFirst: boolean) {
  const [primaryA, secondaryA] = lastFirst
    ? [a.last_name, a.first_name]
    : [a.first_name, a.last_name];
  const [primaryB, secondaryB] = lastFirst
    ? [b.last_name, b.first_name]
    : [b.first_name, b.last_name];
  const cmp = (primaryA ?? '').localeCompare(primaryB ?? '', 'fr');
  if (cmp !== 0) return cmp;
  return (secondaryA ?? '').localeCompare(secondaryB ?? '', 'fr');
}

export function sortMembers(
  members: AdminMemberWithSeasons[],
  sortKey: SortKey | null,
  sortDir: SortDir,
  nameFormat: NameFormat,
) {
  if (!sortKey || sortDir === 'default') {
    return [...members].sort((a, b) => compareNames(a, b, true));
  }
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...members].sort((a, b) => {
    let valA = '';
    let valB = '';
    switch (sortKey) {
      case 'last_name':
        return dir * compareNames(a, b, nameFormat === 'last_first');
      case 'voice_part':
        valA = a.voice_parts?.name ?? '';
        valB = b.voice_parts?.name ?? '';
        break;
      case 'role':
        return dir * ((ROLE_RANK[a.role ?? ''] ?? -1) - (ROLE_RANK[b.role ?? ''] ?? -1));
      case 'birthday':
        valA = a.birthday ?? '';
        valB = b.birthday ?? '';
        break;
      case 'updated':
        valA = a.updated_at ?? '';
        valB = b.updated_at ?? '';
        break;
    }
    return dir * valA.localeCompare(valB, 'fr');
  });
}
