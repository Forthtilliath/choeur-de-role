'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { formatDate, formatDateTimeShort } from '@/utils/dateHelpers';

import type { News } from './types';

function isScheduledFuture(item: News): boolean {
  return !!item.scheduled_at && new Date(item.scheduled_at) > new Date();
}

export function SortableNewsItem({
  item,
  onEdit,
  onTogglePin,
  onTogglePublish,
  onDelete,
}: {
  item: News;
  onEdit: () => void;
  onTogglePin: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const scheduled = isScheduledFuture(item);

  const badge = !item.published
    ? { label: 'Brouillon', className: 'bg-foreground/10 text-foreground/40' }
    : scheduled
      ? {
          label: '🗓 Programmée',
          className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        }
      : { label: 'Publié', className: 'bg-primary/10 text-primary' };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border bg-background flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${item.pinned ? 'border-primary' : 'border-border'} ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Handle + titre + badges */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="text-foreground/30 hover:text-foreground/70 cursor-grab active:cursor-grabbing transition-colors shrink-0 touch-none"
          title="Glisser pour réordonner"
        >
          <GripVertical size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.pinned && <Pin size={13} className="text-primary shrink-0" />}
            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${badge.className}`}>
              {badge.label}
            </span>
            {item.news_files.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/8 text-foreground/50 shrink-0">
                📎 {item.news_files.length}
              </span>
            )}
          </div>
          <p className="text-xs text-foreground/50 mt-0.5">
            {scheduled && item.scheduled_at
              ? `Publication le ${formatDateTimeShort(item.scheduled_at)}`
              : formatDate(item.created_at ?? '')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
          <Pencil size={13} />
          <span className="hidden sm:inline">Modifier</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={onTogglePin} className="gap-1.5">
          {item.pinned ? <PinOff size={13} /> : <Pin size={13} />}
          <span className="hidden sm:inline">{item.pinned ? 'Désépingler' : 'Épingler'}</span>
        </Button>
        <Button size="sm" variant="ghost" onClick={onTogglePublish} className="gap-1.5">
          {item.published ? <EyeOff size={13} /> : <Eye size={13} />}
          <span className="hidden sm:inline">
            {scheduled ? 'Annuler' : item.published ? 'Dépublier' : 'Publier'}
          </span>
        </Button>
        <Button size="sm" variant="danger" onClick={onDelete} className="gap-1.5">
          <Trash2 size={13} />
          <span className="hidden sm:inline">Supprimer</span>
        </Button>
      </div>
    </div>
  );
}
