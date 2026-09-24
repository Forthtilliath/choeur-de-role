'use client';

import { useRef, useState } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { useDndSensors } from '@/hooks/useDndSensors';

import { deleteVoicePart, updateVoicePartsGroupAndOrder } from './clientQueries';
import type { VoicePart } from './types';
import { VoicePartForm } from './VoicePartForm';
import {
  OverlayGroup,
  OverlayRow,
  SortableGroupContainer,
  StaticGroupContainer,
} from './VoicePartGroupRows';
import type { Group } from './voicePartGroups';
import {
  GROUP_PREFIX,
  groupId,
  groupsToPayload,
  initGroups,
  moveOnDragOver,
} from './voicePartGroups';
export function PupitresAdminClient({ initialVoiceParts }: { initialVoiceParts: VoicePart[] }) {
  const [groups, setGroups] = useState<Group[]>(() => initGroups(initialVoiceParts));
  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState<VoicePart | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const beforeDragRef = useRef<Group[]>([]);
  const confirm = useConfirm();
  const sensors = useDndSensors();

  const isGroupDrag = activeId?.startsWith(GROUP_PREFIX) ?? false;
  const activeGroup = isGroupDrag ? (groups.find((g) => groupId(g) === activeId) ?? null) : null;
  const activeVp = !isGroupDrag
    ? (groups.flatMap((g) => g.items).find((vp) => vp.id === activeId) ?? null)
    : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
    beforeDragRef.current = groups;
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over || active.id === over.id) return;
    setGroups((prev) => moveOnDragOver(prev, active.id as string, over.id as string));
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
      !(await confirm({
        message: 'Supprimer ce pupitre ? Les fichiers liés ne seront plus associés.',
        danger: true,
        details: item
          ? { icon: '🎤', label: item.name, sublabel: item.group_name ?? undefined }
          : undefined,
      }))
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
        return prev.map((g) => ({
          ...g,
          items: g.items.map((i) => (i.id === part.id ? part : i)),
        }));
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
        <Button
          onClick={() => {
            setEditingPart(null);
            setShowForm(true);
          }}
        >
          + Ajouter un pupitre
        </Button>
      </div>

      {showForm && (
        <VoicePartForm
          key={editingPart?.id ?? 'new'}
          part={editingPart}
          onClose={() => {
            setShowForm(false);
            setEditingPart(null);
          }}
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
              onEdit={(vp) => {
                setEditingPart(vp);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          )}

          {/* Groupes nommés : réordonnables par drag */}
          <SortableContext items={namedGroups.map(groupId)} strategy={verticalListSortingStrategy}>
            {namedGroups.map((group, idx) => (
              <SortableGroupContainer
                key={group.key}
                group={group}
                isFirst={!nullGroup && idx === 0}
                onEdit={(vp) => {
                  setEditingPart(vp);
                  setShowForm(true);
                }}
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
