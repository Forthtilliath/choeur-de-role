'use client';

import { useNow } from '@/hooks/useNow';
import type { Task } from '@/types/tasks';

import { STATUS_DOT, STATUS_LABEL } from './taskBoardConfig';

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(
    new Date(date),
  );
}

export function PriorityCard({ task, onClickAction }: { task: Task; onClickAction: () => void }) {
  const now = new Date(useNow());
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < now &&
    task.status !== 'done' &&
    task.status !== 'on_hold';

  return (
    <div
      role="button"
      tabIndex={0}
      className="bg-background border border-border rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
      onClick={onClickAction}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        onClickAction();
      }}
    >
      <div className="flex items-start gap-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${STATUS_DOT[task.status]}`}
          title={STATUS_LABEL[task.status]}
        />
        <p className="text-sm text-foreground leading-snug flex-1 min-w-0">{task.title}</p>
      </div>
      <div className="flex items-center justify-between gap-2 pl-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-foreground/40">{STATUS_LABEL[task.status]}</span>
          {task.due_date && (
            <span
              className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-foreground/40'}`}
            >
              · {formatDueDate(task.due_date)}
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
                {`${(a.first_name?.[0] ?? '').toUpperCase()}${(a.last_name?.[0] ?? '').toUpperCase()}`}
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
