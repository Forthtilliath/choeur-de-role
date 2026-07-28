'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { DURATION_UNIT_LABELS } from '@/components/ui/DurationInput';
import type { Task, TaskPriority } from '@/types/tasks';

const PRIORITY_BADGE: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Basse', className: 'bg-foreground/8 text-foreground/50' },
  medium: { label: 'Moyenne', className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
  high: { label: 'Haute', className: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' },
};

function initials(firstName: string | null, lastName: string | null) {
  return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(date));
}

type Props = {
  task: Task;
  overlay?: boolean;
  onClickAction: () => void;
};

export function TaskCard({ task, overlay = false, onClickAction }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const badge = PRIORITY_BADGE[task.priority];
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'done' &&
    task.status !== 'on_hold';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-background border border-border rounded-xl p-3 flex flex-col gap-2 cursor-pointer group transition-all ${
        isDragging ? 'opacity-40' : 'hover:border-primary/40 hover:shadow-sm'
      } ${overlay ? 'shadow-lg rotate-1 opacity-95' : ''}`}
      onClick={onClickAction}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="shrink-0 mt-0.5 text-foreground/20 hover:text-foreground/50 transition-colors cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>
        <p className="text-sm text-foreground leading-snug flex-1 min-w-0">{task.title}</p>
      </div>

      <div className="flex items-center justify-between gap-2 pl-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.className}`}>
            {badge.label}
          </span>
          {task.due_date && (
            <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-foreground/40'}`}>
              {formatDueDate(task.due_date)}
            </span>
          )}
          {task.duration_value && task.duration_unit && (
            <span className="text-[10px] font-medium text-foreground/40">
              ⏱ {task.duration_value}{DURATION_UNIT_LABELS[task.duration_unit]}
            </span>
          )}
          {task.category && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${task.category.color}20`, color: task.category.color }}
            >
              {task.category.name}
            </span>
          )}
        </div>

        {task.assignees.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignees.slice(0, 3).map((a) => (
              <span
                key={a.member_id}
                className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center border border-background"
                title={`${a.first_name ?? ''} ${a.last_name ?? ''}`.trim()}
              >
                {initials(a.first_name, a.last_name)}
              </span>
            ))}
            {task.assignees.length > 3 && (
              <span className="w-5 h-5 rounded-full bg-foreground/10 text-foreground/50 text-[9px] font-bold flex items-center justify-center border border-background">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
