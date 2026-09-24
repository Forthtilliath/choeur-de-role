'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import type { Task } from '@/types/tasks';

import type { COLUMNS } from './taskBoardConfig';
import { TaskCard } from './TaskCard';

export function TaskColumn({
  column,
  tasks,
  readOnly,
  onAddAction,
  onTaskClickAction,
}: {
  column: (typeof COLUMNS)[number];
  tasks: Task[];
  readOnly: boolean;
  onAddAction: () => void;
  onTaskClickAction: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full shrink-0 ${column.dotClass}`} />
        <span className="text-sm font-medium text-foreground">{column.label}</span>
        <span className="text-xs text-foreground/40 bg-muted px-1.5 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
      {!readOnly && (
        <button
          onClick={onAddAction}
          className="w-6 h-6 flex items-center justify-center rounded-md text-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
          title="Nouvelle tâche"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );

  if (readOnly) {
    return (
      <div className="flex flex-col gap-3 min-w-0">
        {header}
        <div className="flex flex-col gap-2 min-h-24 rounded-xl p-1.5 bg-background-secondary">
          {tasks.length === 0 && (
            <p className="text-xs text-foreground/30 text-center py-4 italic">
              {column.emptyLabel}
            </p>
          )}
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClickAction={() => onTaskClickAction(task)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {header}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2 min-h-24 rounded-xl p-1.5 transition-colors ${
            isOver ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-background-secondary'
          }`}
        >
          {tasks.length === 0 && !isOver && (
            <p className="text-xs text-foreground/30 text-center py-4 italic">
              {column.emptyLabel}
            </p>
          )}
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClickAction={() => onTaskClickAction(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
