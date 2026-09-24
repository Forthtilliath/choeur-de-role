import { getVoicePartBg, MemberCell } from './MemberCell';
import type { Column, TrombiMember } from './types';

export type TrombiSortKey = 'first_name' | 'last_name' | 'voice_part' | 'address';
export type TrombiSortDir = 'asc' | 'desc';

const SORTABLE_KEYS: string[] = ['first_name', 'last_name', 'voice_part', 'address'];

type Props = {
  members: TrombiMember[];
  columns: Column[];
  sortKey: TrombiSortKey;
  sortDir: TrombiSortDir;
  onSortAction: (key: TrombiSortKey) => void;
};

export function TrombiTable({ members, columns, sortKey, sortDir, onSortAction }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background-secondary border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-left font-medium text-xs text-foreground/50 tracking-wide whitespace-nowrap"
                >
                  {SORTABLE_KEYS.includes(col.key) ? (
                    <button
                      onClick={() => onSortAction(col.key as TrombiSortKey)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {col.label}
                      <span className="text-xs opacity-60">
                        {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="dark:bg-white dark:text-gray-900">
            {members.map((member, memberIndex) => (
              <tr
                key={member.id}
                className={`${getVoicePartBg(member.voice_parts?.name)} border-b border-white/40 dark:border-black/10 last:border-0`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">
                    <MemberCell
                      col={col}
                      member={member}
                      priority={col.key === 'photo' && memberIndex < 3}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
