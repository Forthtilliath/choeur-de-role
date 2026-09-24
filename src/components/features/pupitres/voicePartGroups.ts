import { arrayMove } from '@dnd-kit/sortable';

import type { VoicePart } from './types';

export const GROUP_PREFIX = '__group__';

export type Group = { key: string; name: string | null; items: VoicePart[] };

export function initGroups(initialVoiceParts: VoicePart[]): Group[] {
  const sorted = [...initialVoiceParts].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const groupMap = new Map<string, Group>([
    ['__null__', { key: '__null__', name: null, items: [] }],
  ]);
  for (const vp of sorted) {
    const key = vp.group_name ?? '__null__';
    if (!groupMap.has(key)) groupMap.set(key, { key, name: vp.group_name, items: [] });
    groupMap.get(key)!.items.push(vp);
  }
  return Array.from(groupMap.values()).filter((g) => g.items.length > 0);
}

export function groupsToPayload(groups: Group[]) {
  let idx = 0;
  return groups.flatMap((g) =>
    g.items.map((vp) => ({ id: vp.id, group_name: g.name, order_index: idx++ })),
  );
}

export const groupId = (g: Group) => `${GROUP_PREFIX}${g.key}`;

// Nouvel état des groupes pendant un survol de glisser-déposer (groupe entier ou pupitre seul)
export function moveOnDragOver(prev: Group[], activeStr: string, overStr: string): Group[] {
  if (activeStr.startsWith(GROUP_PREFIX)) {
    // Group drag: only swap groups with other group headers
    if (!overStr.startsWith(GROUP_PREFIX)) return prev;
    const ai = prev.findIndex((g) => groupId(g) === activeStr);
    const oi = prev.findIndex((g) => groupId(g) === overStr);
    if (ai === -1 || oi === -1 || ai === oi) return prev;
    return arrayMove(prev, ai, oi);
  }

  // Item drag: move item across groups if needed
  const srcGroupIdx = prev.findIndex((g) => g.items.some((i) => i.id === activeStr));
  if (srcGroupIdx === -1) return prev;

  let dstGroupIdx: number;
  let dstItemIdx: number;

  if (overStr.startsWith(GROUP_PREFIX)) {
    dstGroupIdx = prev.findIndex((g) => groupId(g) === overStr);
    dstItemIdx = 0;
  } else {
    dstGroupIdx = prev.findIndex((g) => g.items.some((i) => i.id === overStr));
    dstItemIdx = prev[dstGroupIdx]?.items.findIndex((i) => i.id === overStr) ?? -1;
  }

  if (dstGroupIdx === -1) return prev;

  if (srcGroupIdx === dstGroupIdx) {
    // Same group: reorder within
    const srcItemIdx = prev[srcGroupIdx]?.items.findIndex((i) => i.id === activeStr) ?? -1;
    if (srcItemIdx === -1 || srcItemIdx === dstItemIdx) return prev;
    return prev.map((g, gi) =>
      gi === srcGroupIdx ? { ...g, items: arrayMove(g.items, srcItemIdx, dstItemIdx) } : g,
    );
  }

  // Cross-group move
  const newGroups = prev.map((g) => ({ ...g, items: [...g.items] }));
  const srcItems = newGroups[srcGroupIdx]?.items;
  const dstItems = newGroups[dstGroupIdx]?.items;
  if (!srcItems || !dstItems) return prev;
  const [movedItem] = srcItems.splice(
    srcItems.findIndex((i) => i.id === activeStr),
    1,
  );
  if (!movedItem) return prev;
  dstItems.splice(dstItemIdx, 0, movedItem);
  return newGroups;
}
