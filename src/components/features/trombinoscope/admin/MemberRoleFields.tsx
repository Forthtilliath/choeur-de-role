import { Select } from '@/components/ui/Select';

import { ROLE_LABELS } from '../types';

const ROLE_RANK: Record<string, number> = { member: 0, ca: 1, admin: 2, super_admin: 3 };
const rankOf = (role: string | null | undefined) => ROLE_RANK[role ?? 'member'] ?? 0;

type Props = {
  memberRole: string | null;
  currentUserRole: string;
  role: string;
  onRoleChangeAction: (role: string) => void;
  bureauRole: string;
  onBureauRoleChangeAction: (value: string) => void;
};

// Rôle modifiable uniquement vers un rang inférieur à celui de l'utilisateur courant
export function MemberRoleFields({
  memberRole,
  currentUserRole,
  role,
  onRoleChangeAction,
  bureauRole,
  onBureauRoleChangeAction,
}: Props) {
  const canEditRole = rankOf(currentUserRole) > rankOf(memberRole);
  const availableRoles = Object.keys(ROLE_RANK).filter((r) => rankOf(r) < rankOf(currentUserRole));

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-foreground/50">Rôle</span>
        {canEditRole ? (
          <Select
            value={role}
            onChange={(e) => onRoleChangeAction(e.target.value)}
            className="px-4"
          >
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        ) : (
          <p className="text-sm text-foreground/60 px-4 py-2 border border-border rounded-lg bg-background-secondary">
            {ROLE_LABELS[memberRole ?? 'member']}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="member-bureau-role" className="text-xs font-medium text-foreground/50">
          Rôle bureau
        </label>
        <input
          id="member-bureau-role"
          value={bureauRole}
          onChange={(e) => onBureauRoleChangeAction(e.target.value)}
          className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
          placeholder="Président"
        />
      </div>
    </div>
  );
}
