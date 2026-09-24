import { formatDateTimeCompact } from '@/utils/dateHelpers';

import type { AdminMemberWithSeasons } from '../types';

type Props = {
  members: AdminMemberWithSeasons[];
  onViewAction: (member: AdminMemberWithSeasons) => void;
};

export function RecentUpdatesPanel({ members, onViewAction }: Props) {
  return (
    <div className="border border-primary/30 bg-primary/5 rounded-2xl p-4 flex flex-col gap-2">
      <p className="text-xs font-medium text-primary mb-1">Modifications des dernières 48h</p>
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-3 text-sm">
          <span className="text-foreground font-medium">
            {m.first_name} {m.last_name}
          </span>
          <span className="text-foreground/40 text-xs">
            {m.updated_at ? formatDateTimeCompact(m.updated_at) : ''}
          </span>
          <button onClick={() => onViewAction(m)} className="text-xs text-primary hover:opacity-70">
            Voir
          </button>
        </div>
      ))}
    </div>
  );
}
