'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

import type { MemberLink, Visibility } from './types';
import { VISIBILITY_BADGE, VISIBILITY_LABEL } from './types';

export function SortableLink({
  link,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  link: MemberLink;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 transition-shadow ${
        isDragging
          ? 'shadow-xl ring-1 ring-primary/30 z-50 opacity-80'
          : !link.active
            ? 'opacity-50'
            : ''
      }`}
    >
      {/* Info : handle + label + url */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Drag handle */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/60 shrink-0 transition-colors touch-none"
          title="Glisser pour réordonner"
        >
          <GripVertical size={18} />
        </div>

        {/* Label + url + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{link.label}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${VISIBILITY_BADGE[(link.visibility as Visibility) ?? 'member']}`}
            >
              {VISIBILITY_LABEL[(link.visibility as Visibility) ?? 'member']}
            </span>
          </div>
          <p className="text-xs text-foreground/50 truncate">{link.url}</p>
          {link.description && (
            <p className="text-xs text-foreground/40 mt-0.5 truncate">{link.description}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
          <Pencil size={13} />
          <span className="hidden sm:inline">Modifier</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={onToggleActive} className="gap-1.5">
          {link.active ? <EyeOff size={13} /> : <Eye size={13} />}
          <span className="hidden sm:inline">{link.active ? 'Désactiver' : 'Activer'}</span>
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete} className="gap-1.5">
          <Trash2 size={13} />
          <span className="hidden sm:inline">Supprimer</span>
        </Button>
      </div>
    </div>
  );
}
