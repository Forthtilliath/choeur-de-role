'use client';

import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/Button';

import type { VoicePart } from './types';
import type { Group } from './voicePartGroups';
import { GROUP_PREFIX } from './voicePartGroups';

// ── Sortable item row ─────────────────────────────────────────────────────────

type RowProps = { vp: VoicePart; onEdit: (vp: VoicePart) => void; onDelete: (id: string) => void };

function SortableRow({ vp, onEdit, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: vp.id,
  });

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

export function OverlayRow({ vp }: { vp: VoicePart }) {
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

export function StaticGroupContainer({
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

export function SortableGroupContainer({
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

export function OverlayGroup({ group }: { group: Group }) {
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
