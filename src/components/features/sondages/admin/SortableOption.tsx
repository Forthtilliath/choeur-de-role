'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

import type { PollOptionDraft } from '../types';

type SortableOptionProps = {
  id: string;
  opt: PollOptionDraft;
  index: number;
  canRemove: boolean;
  onChange: (label: string) => void;
  onRemove: () => void;
};

export function SortableOption({
  id,
  opt,
  index,
  canRemove,
  onChange,
  onRemove,
}: SortableOptionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-foreground/25 hover:text-foreground/50 cursor-grab active:cursor-grabbing touch-none"
        tabIndex={-1}
      >
        <GripVertical className="w-3.5 h-3.5 shrink-0" />
      </button>
      <input
        value={opt.label}
        onChange={(e) => onChange(e.target.value)}
        required
        className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
        placeholder={`Option ${index + 1}...`}
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="text-foreground/30 hover:text-danger disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
