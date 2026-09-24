'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

import { DurationInput } from '@/components/ui/DurationInput';
import { Select } from '@/components/ui/Select';
import type { DurationUnit, TaskCategory, TaskTemplateItem } from '@/types/tasks';

import { PRIORITY_KEYS, PRIORITY_LABELS, STATUS_KEYS, STATUS_LABELS } from './templateLabels';

type Props = {
  item: TaskTemplateItem;
  categories: TaskCategory[];
  isFirst: boolean;
  isLast: boolean;
  onMoveAction: (direction: -1 | 1) => void;
  onFieldUpdateAction: (field: keyof TaskTemplateItem, value: string) => void;
  onDurationUpdateAction: (value: number | null, unit: DurationUnit | null) => void;
  onCategoryUpdateAction: (categoryId: string | null) => void;
  onDeleteAction: () => void;
};

// Tâche type éditable en ligne (titre au clic, sélecteurs enregistrés à chaque changement)
export function TemplateItemRow({
  item,
  categories,
  isFirst,
  isLast,
  onMoveAction,
  onFieldUpdateAction,
  onDurationUpdateAction,
  onCategoryUpdateAction,
  onDeleteAction,
}: Props) {
  const [editingTitle, setEditingTitle] = useState(false);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 group">
      {/* Reorder */}
      <div className="flex flex-col shrink-0">
        <button
          onClick={() => onMoveAction(-1)}
          disabled={isFirst}
          className="text-foreground/20 hover:text-foreground/60 disabled:opacity-0 transition-colors"
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={() => onMoveAction(1)}
          disabled={isLast}
          className="text-foreground/20 hover:text-foreground/60 disabled:opacity-0 transition-colors"
        >
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            defaultValue={item.title}
            onBlur={(e) => {
              onFieldUpdateAction('title', e.target.value || item.title);
              setEditingTitle(false);
            }}
            className="border border-primary rounded-md px-2 py-1 text-sm bg-background text-foreground focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingTitle(true)}
            className="text-sm text-foreground text-left truncate hover:text-primary transition-colors"
          >
            {item.title}
          </button>
        )}
        <Select
          value={item.priority}
          onChange={(e) => onFieldUpdateAction('priority', e.target.value)}
          className="text-xs rounded-md px-2 py-1"
        >
          {PRIORITY_KEYS.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <Select
          value={item.status}
          onChange={(e) => onFieldUpdateAction('status', e.target.value)}
          className="text-xs rounded-md px-2 py-1"
        >
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <DurationInput
          value={item.duration_value}
          unit={item.duration_unit}
          onChangeAction={onDurationUpdateAction}
        />
        <Select
          value={item.category_id ?? ''}
          onChange={(e) => onCategoryUpdateAction(e.target.value || null)}
          className="text-xs rounded-md px-2 py-1"
        >
          <option value="">— Catégorie —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <button
        onClick={onDeleteAction}
        className="shrink-0 text-foreground/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
