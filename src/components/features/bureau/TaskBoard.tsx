'use client';

import { useMemo, useState } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { useDndSensors } from '@/hooks/useDndSensors';
import type {
  CaMember,
  Task,
  TaskCategory,
  TaskComment,
  TaskPriority,
  TaskStatus,
} from '@/types/tasks';

import { reorderTasks } from './actions';
import { PriorityView } from './PriorityView';
import { COLUMNS, STATUSES } from './taskBoardConfig';
import { TaskCard } from './TaskCard';
import { TaskColumn } from './TaskColumn';
import { TaskModal } from './TaskModal';

type TaskView = 'backlog' | 'by_priority';

const VIEWS: { id: TaskView; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'by_priority', label: 'Par priorité' },
];

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

export function TaskBoard({
  projectId,
  initialTasks,
  initialComments,
  caMembers,
  categories,
  currentUserId,
  isAdmin,
  readOnly = false,
}: Props) {
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

    setTasks((prev) =>
      prev.map((t) => (t.id === activeTaskId ? { ...t, status: targetStatus } : t)),
    );
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
      {view === 'backlog' &&
        (readOnly ? (
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
        ))}

      {/* Par priorité view */}
      {view === 'by_priority' && (
        <PriorityView
          tasksByPriority={tasksByPriority}
          readOnly={readOnly}
          onCreateAction={setCreatePriority}
          onTaskClickAction={setSelectedTask}
        />
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
