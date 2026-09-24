'use client';

import { Plus } from 'lucide-react';

import type { Task, TaskPriority } from '@/types/tasks';

import { PriorityCard } from './PriorityCard';
import { PRIORITY_COLUMNS } from './taskBoardConfig';

type Props = {
  tasksByPriority: Record<TaskPriority, Task[]>;
  readOnly: boolean;
  onCreateAction: (priority: TaskPriority) => void;
  onTaskClickAction: (task: Task) => void;
};

// Vue « Par priorité » : une colonne par niveau, sans glisser-déposer
export function PriorityView({
  tasksByPriority,
  readOnly,
  onCreateAction,
  onTaskClickAction,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {PRIORITY_COLUMNS.map((col) => (
        <div key={col.id} className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotClass}`} />
              <span className="text-sm font-medium text-foreground">{col.label}</span>
              <span className="text-xs text-foreground/40 bg-muted px-1.5 py-0.5 rounded-full font-medium">
                {tasksByPriority[col.id].length}
              </span>
            </div>
            {!readOnly && (
              <button
                onClick={() => onCreateAction(col.id)}
                className="w-6 h-6 flex items-center justify-center rounded-md text-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
                title="Nouvelle tâche"
              >
                <Plus size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 min-h-24 rounded-xl p-1.5 bg-background-secondary">
            {tasksByPriority[col.id].length === 0 && (
              <p className="text-xs text-foreground/30 text-center py-4 italic">{col.emptyLabel}</p>
            )}
            {tasksByPriority[col.id].map((task) => (
              <PriorityCard
                key={task.id}
                task={task}
                onClickAction={() => onTaskClickAction(task)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
