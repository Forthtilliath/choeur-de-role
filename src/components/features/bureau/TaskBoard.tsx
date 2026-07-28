'use client';

import { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useDndSensors } from '@/hooks/useDndSensors';
import type { CaMember, Task, TaskCategory, TaskComment, TaskPriority, TaskStatus } from '@/types/tasks';
import { reorderTasks } from './actions';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';

type TaskView = 'backlog' | 'by_priority';

const VIEWS: { id: TaskView; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'by_priority', label: 'Par priorité' },
];

const STATUSES: TaskStatus[] = ['on_hold', 'todo', 'in_progress', 'done'];

const COLUMNS: { id: TaskStatus; label: string; dotClass: string; emptyLabel: string }[] = [
  { id: 'on_hold', label: 'En attente', dotClass: 'bg-amber-400', emptyLabel: 'Aucune tâche en attente' },
  { id: 'todo', label: 'À faire', dotClass: 'bg-foreground/30', emptyLabel: 'Aucune tâche à faire' },
  { id: 'in_progress', label: 'En cours', dotClass: 'bg-blue-500', emptyLabel: 'Aucune tâche en cours' },
  { id: 'done', label: 'Terminé', dotClass: 'bg-green-500', emptyLabel: 'Aucune tâche terminée' },
];

const PRIORITY_COLUMNS: { id: TaskPriority; label: string; dotClass: string; emptyLabel: string }[] = [
  { id: 'high', label: 'Haute', dotClass: 'bg-red-500', emptyLabel: 'Aucune tâche haute priorité' },
  { id: 'medium', label: 'Moyenne', dotClass: 'bg-amber-400', emptyLabel: 'Aucune tâche priorité moyenne' },
  { id: 'low', label: 'Basse', dotClass: 'bg-foreground/30', emptyLabel: 'Aucune tâche basse priorité' },
];

const STATUS_DOT: Record<TaskStatus, string> = {
  on_hold: 'bg-amber-400',
  todo: 'bg-foreground/30',
  in_progress: 'bg-blue-500',
  done: 'bg-green-500',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  on_hold: 'En attente',
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
};

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(date));
}

function TaskColumn({
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
            <p className="text-xs text-foreground/30 text-center py-4 italic">{column.emptyLabel}</p>
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
            <p className="text-xs text-foreground/30 text-center py-4 italic">{column.emptyLabel}</p>
          )}
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClickAction={() => onTaskClickAction(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function PriorityCard({
  task,
  onClickAction,
}: {
  task: Task;
  onClickAction: () => void;
}) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== 'done' &&
    task.status !== 'on_hold';

  return (
    <div
      className="bg-background border border-border rounded-xl p-3 flex flex-col gap-2 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
      onClick={onClickAction}
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
            <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-500' : 'text-foreground/40'}`}>
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

type Props = {
  projectId: string;
  initialTasks: Task[];
  initialComments: TaskComment[];
  caMembers: CaMember[];
  categories: TaskCategory[];
  currentUserId: string;
  isAdmin: boolean;
  readOnly?: boolean;
};

export function TaskBoard({ projectId, initialTasks, initialComments, caMembers, categories, currentUserId, isAdmin, readOnly = false }: Props) {
  const [view, setView] = useState<TaskView>('backlog');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [comments, setComments] = useState<TaskComment[]>(initialComments);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null | undefined>(undefined);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [createPriority, setCreatePriority] = useState<TaskPriority | null>(null);

  const sensors = useDndSensors();

  const tasksByStatus = useMemo(() => {
    const groups: Record<TaskStatus, Task[]> = { on_hold: [], todo: [], in_progress: [], done: [] };
    for (const t of tasks) groups[t.status].push(t);
    for (const key of STATUSES) groups[key].sort((a, b) => a.position - b.position);
    return groups;
  }, [tasks]);

  const tasksByPriority = useMemo(() => {
    const groups: Record<TaskPriority, Task[]> = { high: [], medium: [], low: [] };
    for (const t of tasks) groups[t.priority].push(t);
    for (const key of ['high', 'medium', 'low'] as TaskPriority[]) {
      groups[key].sort((a, b) => a.position - b.position);
    }
    return groups;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeTaskId = active.id as string;
    const overId = over.id as string;
    if (activeTaskId === overId) return;

    const activeTask = tasks.find((t) => t.id === activeTaskId);
    if (!activeTask) return;

    const targetStatus: TaskStatus | undefined = STATUSES.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (!targetStatus || targetStatus === activeTask.status) return;

    setTasks((prev) => prev.map((t) => (t.id === activeTaskId ? { ...t, status: targetStatus } : t)));
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const currentTask = tasks.find((t) => t.id === activeTaskId);
    if (!currentTask) return;

    const columnTasks = tasks
      .filter((t) => t.status === currentTask.status)
      .sort((a, b) => a.position - b.position);

    const activeIndex = columnTasks.findIndex((t) => t.id === activeTaskId);
    const isOverColumn = STATUSES.includes(overId as TaskStatus);
    const overIndex = isOverColumn
      ? columnTasks.length - 1
      : columnTasks.findIndex((t) => t.id === overId);

    if (activeIndex === -1) return;

    const newOrder =
      overIndex !== -1 && activeIndex !== overIndex
        ? arrayMove(columnTasks, activeIndex, overIndex)
        : columnTasks;

    const updates = newOrder.map((t, i) => ({
      id: t.id,
      status: currentTask.status,
      position: (i + 1) * 1000,
    }));

    setTasks((prev) => {
      const map = new Map(updates.map((u) => [u.id, u]));
      return prev.map((t) => {
        const u = map.get(t.id);
        return u ? { ...t, position: u.position, status: u.status } : t;
      });
    });

    await reorderTasks(updates);
  }

  function handleTaskSaved(saved: Task) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved];
    });
  }

  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  const modalOpen = selectedTask !== undefined || createStatus !== null || createPriority !== null;
  const modalComments = selectedTask ? comments.filter((c) => c.task_id === selectedTask.id) : [];

  function closeModal() {
    setSelectedTask(undefined);
    setCreateStatus(null);
    setCreatePriority(null);
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border mb-6">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              view === v.id
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/50 hover:text-foreground'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Backlog view */}
      {view === 'backlog' && (
        readOnly ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COLUMNS.map((col) => (
              <TaskColumn
                key={col.id}
                column={col}
                tasks={tasksByStatus[col.id]}
                readOnly
                onAddAction={() => {}}
                onTaskClickAction={(task) => setSelectedTask(task)}
              />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLUMNS.map((col) => (
                <TaskColumn
                  key={col.id}
                  column={col}
                  tasks={tasksByStatus[col.id]}
                  readOnly={false}
                  onAddAction={() => setCreateStatus(col.id)}
                  onTaskClickAction={(task) => setSelectedTask(task)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} overlay onClickAction={() => {}} />}
            </DragOverlay>
          </DndContext>
        )
      )}

      {/* Par priorité view */}
      {view === 'by_priority' && (
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
                    onClick={() => setCreatePriority(col.id)}
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
                    onClickAction={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <TaskModal
          task={selectedTask ?? null}
          projectId={projectId}
          initialStatus={createStatus ?? 'todo'}
          initialPriority={createPriority ?? undefined}
          initialComments={modalComments}
          caMembers={caMembers}
          categories={categories}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          readOnly={readOnly}
          onCloseAction={closeModal}
          onSavedAction={(saved) => {
            handleTaskSaved(saved);
            if (!selectedTask) setComments((prev) => [...prev]);
          }}
          onDeletedAction={(id) => {
            handleTaskDeleted(id);
            setComments((prev) => prev.filter((c) => c.task_id !== id));
          }}
        />
      )}
    </>
  );
}
