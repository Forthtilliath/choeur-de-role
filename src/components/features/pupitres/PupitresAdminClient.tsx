'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRef, useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { deleteVoicePart, updateVoicePartsGroupAndOrder, upsertVoicePart } from './clientQueries';
import { VoicePart } from './types';
import { useDndSensors } from '@/hooks/useDndSensors';

const GROUP_PREFIX = '__group__';

type Group = { key: string; name: string | null; items: VoicePart[] };

function initGroups(initialVoiceParts: VoicePart[]): Group[] {
  const sorted = [...initialVoiceParts].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  const groupMap = new Map<string, Group>([['__null__', { key: '__null__', name: null, items: [] }]]);
  for (const vp of sorted) {
    const key = vp.group_name ?? '__null__';
    if (!groupMap.has(key)) groupMap.set(key, { key, name: vp.group_name, items: [] });
    groupMap.get(key)!.items.push(vp);
  }
  return Array.from(groupMap.values()).filter((g) => g.items.length > 0);
}

function groupsToPayload(groups: Group[]) {
  let idx = 0;
  return groups.flatMap((g) =>
    g.items.map((vp) => ({ id: vp.id, group_name: g.name, order_index: idx++ })),
  );
}

// ── Sortable item row ─────────────────────────────────────────────────────────

type RowProps = { vp: VoicePart; onEdit: (vp: VoicePart) => void; onDelete: (id: string) => void };

function SortableRow({ vp, onEdit, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: vp.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background ${isDragging ? 'opacity-0' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        suppressHydrationWarning
        className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/60 px-1 touch-none select-none"
      >
        ⠿
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{vp.name}</p>
        {vp.group_name && <p className="text-xs text-foreground/40">Groupe : {vp.group_name}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button size="sm" variant="ghost" onClick={() => onEdit(vp)}>
          <span className="hidden sm:inline">Modifier</span>
          <span className="sm:hidden">✎</span>
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(vp.id)}>
          <span className="hidden sm:inline">Supprimer</span>
          <span className="sm:hidden">✕</span>
        </Button>
      </div>
    </div>
  );
}

function OverlayRow({ vp }: { vp: VoicePart }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background shadow-xl opacity-95">
      <span className="cursor-grabbing text-foreground/30 px-1 select-none">⠿</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{vp.name}</p>
        {vp.group_name && <p className="text-xs text-foreground/40">Groupe : {vp.group_name}</p>}
      </div>
    </div>
  );
}

// ── Shared group items list ───────────────────────────────────────────────────

function GroupItems({
  group,
  onEdit,
  onDelete,
}: {
  group: Group;
  onEdit: (vp: VoicePart) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <SortableContext items={group.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
      <div className="flex flex-col gap-2">
        {group.items.map((vp) => (
          <SortableRow key={vp.id} vp={vp} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </SortableContext>
  );
}

// ── Static group (sans groupe — always first, not draggable) ──────────────────

function StaticGroupContainer({
  group,
  onEdit,
  onDelete,
}: {
  group: Group;
  onEdit: (vp: VoicePart) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-foreground/50 uppercase tracking-wide">
          Sans groupe
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <GroupItems group={group} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

// ── Sortable group container ──────────────────────────────────────────────────

function SortableGroupContainer({
  group,
  isFirst,
  onEdit,
  onDelete,
}: {
  group: Group;
  isFirst: boolean;
  onEdit: (vp: VoicePart) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${GROUP_PREFIX}${group.key}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-2 ${isDragging ? 'opacity-0' : ''}`}
    >
      <div className={`flex items-center gap-2 ${!isFirst ? 'mt-4' : ''}`}>
        <button
          {...attributes}
          {...listeners}
          type="button"
          suppressHydrationWarning
          title="Réordonner le groupe"
          className="cursor-grab active:cursor-grabbing text-foreground/20 hover:text-foreground/50 px-1 touch-none select-none text-xs"
        >
          ⠿
        </button>
        <span className="text-xs font-medium text-foreground/50 uppercase tracking-wide">
          {group.name}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <GroupItems group={group} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function OverlayGroup({ group }: { group: Group }) {
  return (
    <div className="flex flex-col gap-2 opacity-95">
      <div className="flex items-center gap-2">
        <span className="cursor-grabbing text-foreground/20 px-1 select-none text-xs">⠿</span>
        <span className="text-xs font-medium text-foreground/50 uppercase tracking-wide">
          {group.name ?? '(Sans groupe)'}
        </span>
        <div className="w-24 h-px bg-border" />
      </div>
      {group.items.map((vp) => (
        <div
          key={vp.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background shadow-xl"
        >
          <span className="text-foreground/30 px-1 select-none">⠿</span>
          <p className="text-sm font-medium text-foreground">{vp.name}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PupitresAdminClient({ initialVoiceParts }: { initialVoiceParts: VoicePart[] }) {
  const [groups, setGroups] = useState<Group[]>(() => initGroups(initialVoiceParts));
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState<VoicePart | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const beforeDragRef = useRef<Group[]>([]);
  const confirm = useConfirm();
  const sensors = useDndSensors();

  const isGroupDrag = activeId?.startsWith(GROUP_PREFIX) ?? false;
  const activeGroup = isGroupDrag
    ? groups.find((g) => `${GROUP_PREFIX}${g.key}` === activeId) ?? null
    : null;
  const activeVp = !isGroupDrag
    ? groups.flatMap((g) => g.items).find((vp) => vp.id === activeId) ?? null
    : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
    beforeDragRef.current = groups;
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return;
    const activeStr = active.id as string;
    const overStr = over.id as string;

    if (activeStr.startsWith(GROUP_PREFIX)) {
      // Group drag: only swap groups with other group headers
      if (!overStr.startsWith(GROUP_PREFIX)) return;
      setGroups((prev) => {
        const ai = prev.findIndex((g) => `${GROUP_PREFIX}${g.key}` === activeStr);
        const oi = prev.findIndex((g) => `${GROUP_PREFIX}${g.key}` === overStr);
        if (ai === -1 || oi === -1 || ai === oi) return prev;
        return arrayMove(prev, ai, oi);
      });
    } else {
      // Item drag: move item across groups if needed
      setGroups((prev) => {
        const srcGroupIdx = prev.findIndex((g) => g.items.some((i) => i.id === activeStr));
        if (srcGroupIdx === -1) return prev;

        let dstGroupIdx: number;
        let dstItemIdx: number;

        if (overStr.startsWith(GROUP_PREFIX)) {
          dstGroupIdx = prev.findIndex((g) => `${GROUP_PREFIX}${g.key}` === overStr);
          dstItemIdx = 0;
        } else {
          dstGroupIdx = prev.findIndex((g) => g.items.some((i) => i.id === overStr));
          if (dstGroupIdx === -1) return prev;
          dstItemIdx = prev[dstGroupIdx].items.findIndex((i) => i.id === overStr);
        }

        if (dstGroupIdx === -1) return prev;

        if (srcGroupIdx === dstGroupIdx) {
          // Same group: reorder within
          const srcItemIdx = prev[srcGroupIdx].items.findIndex((i) => i.id === activeStr);
          if (srcItemIdx === dstItemIdx) return prev;
          return prev.map((g, gi) =>
            gi === srcGroupIdx ? { ...g, items: arrayMove(g.items, srcItemIdx, dstItemIdx) } : g,
          );
        }

        // Cross-group move
        const newGroups = prev.map((g) => ({ ...g, items: [...g.items] }));
        const [movedItem] = newGroups[srcGroupIdx].items.splice(
          newGroups[srcGroupIdx].items.findIndex((i) => i.id === activeStr),
          1,
        );
        newGroups[dstGroupIdx].items.splice(dstItemIdx, 0, movedItem);
        return newGroups;
      });
    }
  }

  function handleDragEnd({ over }: DragEndEvent) {
    setActiveId(null);
    if (!over) {
      setGroups(beforeDragRef.current);
      return;
    }
    updateVoicePartsGroupAndOrder(groupsToPayload(groups));
  }

  function handleDragCancel() {
    setActiveId(null);
    setGroups(beforeDragRef.current);
  }

  async function handleDelete(id: string) {
    const item = groups.flatMap((g) => g.items).find((vp) => vp.id === id);
    if (
      !await confirm({
        message: 'Supprimer ce pupitre ? Les fichiers liés ne seront plus associés.',
        danger: true,
        details: item
          ? { icon: '🎤', label: item.name, sublabel: item.group_name ?? undefined }
          : undefined,
      })
    )
      return;
    const ok = await deleteVoicePart(id);
    if (ok) {
      setGroups((prev) =>
        prev
          .map((g) => ({ ...g, items: g.items.filter((vp) => vp.id !== id) }))
          .filter((g) => g.items.length > 0),
      );
      toast.success('Pupitre supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleSave(part: VoicePart) {
    setGroups((prev) => {
      const existsInAnyGroup = prev.some((g) => g.items.some((i) => i.id === part.id));
      if (existsInAnyGroup) {
        return prev.map((g) => ({ ...g, items: g.items.map((i) => (i.id === part.id ? part : i)) }));
      }
      const targetKey = part.group_name ?? '__null__';
      const targetGroup = prev.find((g) => g.key === targetKey);
      if (targetGroup) {
        return prev.map((g) => (g.key === targetKey ? { ...g, items: [...g.items, part] } : g));
      }
      return [...prev, { key: targetKey, name: part.group_name, items: [part] }];
    });
    setShowForm(false);
    setEditingPart(null);
  }

  const nullGroup = groups.find((g) => g.key === '__null__') ?? null;
  const namedGroups = groups.filter((g) => g.key !== '__null__');
  const existingGroups = namedGroups.map((g) => g.name as string);
  const nextOrderIndex = groups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingPart(null); setShowForm(true); }}>
          + Ajouter un pupitre
        </Button>
      </div>

      {showForm && (
        <VoicePartForm
          key={editingPart?.id ?? 'new'}
          part={editingPart}
          onClose={() => { setShowForm(false); setEditingPart(null); }}
          onSave={handleSave}
          nextOrderIndex={nextOrderIndex}
          existingGroups={existingGroups}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex flex-col gap-2">
          {/* Sans groupe : toujours en premier, non déplaçable */}
          {nullGroup && (
            <StaticGroupContainer
              group={nullGroup}
              onEdit={(vp) => { setEditingPart(vp); setShowForm(true); }}
              onDelete={handleDelete}
            />
          )}

          {/* Groupes nommés : réordonnables par drag */}
          <SortableContext
            items={namedGroups.map((g) => `${GROUP_PREFIX}${g.key}`)}
            strategy={verticalListSortingStrategy}
          >
            {namedGroups.map((group, idx) => (
              <SortableGroupContainer
                key={group.key}
                group={group}
                isFirst={!nullGroup && idx === 0}
                onEdit={(vp) => { setEditingPart(vp); setShowForm(true); }}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeGroup ? (
            <OverlayGroup group={activeGroup} />
          ) : activeVp ? (
            <OverlayRow vp={activeVp} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ── Voice part form ───────────────────────────────────────────────────────────

function VoicePartForm({
  part,
  onClose,
  onSave,
  nextOrderIndex,
  existingGroups,
}: {
  part: VoicePart | null;
  onClose: () => void;
  onSave: (part: VoicePart) => void;
  nextOrderIndex: number;
  existingGroups: string[];
}) {
  const [name, setName] = useState(part?.name ?? '');
  const [groupName, setGroupName] = useState(part?.group_name ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const saved = await upsertVoicePart(
      { name, group_name: groupName || null },
      part?.id,
      nextOrderIndex,
    );
    if (saved) {
      onSave(saved);
      toast.success(part ? 'Pupitre modifié' : 'Pupitre ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-4 text-foreground">
        {part ? 'Modifier le pupitre' : 'Ajouter un pupitre'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Nom</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Ténor"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              Groupe <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              list="groups-list"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Hommes"
            />
            {existingGroups.length > 0 && (
              <datalist id="groups-list">
                {existingGroups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            )}
          </div>
        </div>
        <p className="text-xs text-foreground/40">
          Le groupe est utilisé pour afficher &quot;Hommes&quot; quand Ténor ET Basse sont liés à un
          fichier. Glissez-déposez les pupitres ou les groupes pour les réordonner.
        </p>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : part ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
