'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, ColumnKey } from './types';

export function SortableColumnRow({
  col,
  index,
  total,
  onToggleAction,
}: {
  col: Column;
  index: number;
  total: number;
  onToggleAction: (key: ColumnKey) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: col.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDragging ? 'bg-primary/5 border border-primary/20' : 'hover:bg-background-secondary'}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-foreground/20 hover:text-foreground/60 cursor-grab active:cursor-grabbing transition-colors shrink-0 touch-none"
        title="Glisser pour réordonner"
      >
        ⠿
      </button>
      <button
        type="button"
        onClick={() => onToggleAction(col.key)}
        className={`relative shrink-0 w-8 h-5 rounded-full transition-colors ${col.visible ? 'bg-primary' : 'bg-foreground/20'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${col.visible ? 'translate-x-3' : 'translate-x-0'}`}
        />
      </button>
      <span
        className={`text-sm flex-1 transition-colors ${col.visible ? 'text-foreground' : 'text-foreground/40'}`}
      >
        {col.label}
      </span>
      <span className="text-xs text-foreground/20 shrink-0 font-mono">
        {index + 1}/{total}
      </span>
    </div>
  );
}
