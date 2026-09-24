'use client';

import { useEffect, useRef } from 'react';
import { Mail } from 'lucide-react';

import { Select } from '@/components/ui/Select';

import type { Season } from '../../concerts';

type Props = {
  selectedCount: number;
  allChecked: boolean;
  someSelected: boolean;
  onToggleAllAction: () => void;
  onCopyEmailsAction: () => void;
  seasons: Season[];
  onBulkAssignSeasonAction: (seasonId: string) => void;
};

export function MembersSelectionBar({
  selectedCount,
  allChecked,
  someSelected,
  onToggleAllAction,
  onCopyEmailsAction,
  seasons,
  onBulkAssignSeasonAction,
}: Props) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someSelected && !allChecked;
  }, [someSelected, allChecked]);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-sm">
      <input
        ref={selectAllRef}
        type="checkbox"
        checked={allChecked}
        onChange={onToggleAllAction}
        className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
      />
      <span className="text-foreground/60 flex-1">
        {selectedCount > 0
          ? `${selectedCount} membre${selectedCount > 1 ? 's' : ''} sélectionné${selectedCount > 1 ? 's' : ''}`
          : 'Cliquez sur les lignes pour sélectionner'}
      </span>
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onCopyEmailsAction}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Mail size={13} />
            Copier les emails ({selectedCount})
          </button>
          <div className="flex items-center gap-1.5">
            <Select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onBulkAssignSeasonAction(e.target.value);
                e.target.value = '';
              }}
              className="text-xs px-2 py-1 text-foreground/70 cursor-pointer"
            >
              <option value="" disabled>
                Ajouter à la saison…
              </option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
