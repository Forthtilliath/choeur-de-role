import { useState } from 'react';

import type { AdminMemberWithSeasons } from '../types';

// Mode sélection multiple ; seuls les membres avec email sont sélectionnables
export function useMemberSelection(visibleMembers: AdminMemberWithSeasons[]) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const eligible = visibleMembers.filter((m) => m.email);
  const allChecked = eligible.length > 0 && eligible.every((m) => selectedIds.has(m.id));
  const someSelected = eligible.some((m) => selectedIds.has(m.id));

  function toggleSelectionMode() {
    setSelectionMode((v) => !v);
    setSelectedIds(new Set());
  }

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(allChecked ? new Set() : new Set(eligible.map((m) => m.id)));
  }

  return {
    selectionMode,
    selectedIds,
    allChecked,
    someSelected,
    toggleSelectionMode,
    toggleMember,
    toggleAll,
  };
}
