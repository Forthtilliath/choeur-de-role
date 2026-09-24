'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type {
  CaMember,
  Task,
  TaskCategory,
  TaskComment,
  TaskPriority,
  TaskStatus,
} from '@/types/tasks';

import { createTask, deleteTask, updateTask } from './actions';
import { TaskComments } from './TaskComments';
import type { TaskFormValues } from './TaskFormFields';
import { TaskFormFields } from './TaskFormFields';

type Props = {
  task: Task | null;
  projectId: string;
  initialStatus?: TaskStatus;
  initialPriority?: TaskPriority;
  initialComments: TaskComment[];
  caMembers: CaMember[];
  categories: TaskCategory[];
  currentUserId: string;
  isAdmin: boolean;
  readOnly?: boolean;
  onCloseAction: () => void;
  onSavedAction: (task: Task) => void;
  onDeletedAction: (taskId: string) => void;
};

export function TaskModal({
  task,
  projectId,
  initialStatus = 'todo',
  initialPriority,
  initialComments,
  caMembers,
  categories,
  currentUserId,
  isAdmin,
  readOnly = false,
  onCloseAction,
  onSavedAction,
  onDeletedAction,
}: Props) {
  const isNew = task === null;

  const [values, setValues] = useState<TaskFormValues>(() => ({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? initialPriority ?? 'medium',
    dueDate: task?.due_date ?? '',
    durationValue: task?.duration_value ?? null,
    durationUnit: task?.duration_unit ?? null,
    categoryId: task?.category_id ?? null,
    assigneeIds: task?.assignees.map((a) => a.member_id) ?? [],
  }));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseAction();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCloseAction]);

  async function handleSave() {
    const title = values.title.trim();
    if (!title) return;
    setSaving(true);
    setSaveError('');

    const fields = {
      title,
      description: values.description.trim() || null,
      priority: values.priority,
      due_date: values.dueDate || null,
      duration_value: values.durationValue,
      duration_unit: values.durationUnit,
      category_id: values.categoryId,
    };
    const derived = {
      category: categories.find((c) => c.id === values.categoryId) ?? null,
      assignees: caMembers
        .filter((m) => values.assigneeIds.includes(m.id))
        .map((m) => ({ member_id: m.id, first_name: m.first_name, last_name: m.last_name })),
    };

    if (isNew) {
      const result = await createTask({
        ...fields,
        project_id: projectId,
        description: fields.description ?? undefined,
        due_date: fields.due_date ?? undefined,
        status: initialStatus,
        assignee_ids: values.assigneeIds,
      });
      if ('ok' in result) {
        const now = new Date().toISOString();
        onSavedAction({
          ...fields,
          ...derived,
          id: result.id,
          status: initialStatus,
          position: 0,
          project_id: projectId,
          created_by: currentUserId,
          created_at: now,
          updated_at: now,
        });
        onCloseAction();
      } else {
        setSaveError(result.error);
      }
    } else {
      const result = await updateTask(task.id, { ...fields, assignee_ids: values.assigneeIds });
      if ('ok' in result) {
        onSavedAction({ ...task, ...fields, ...derived, updated_at: new Date().toISOString() });
        onCloseAction();
      } else {
        setSaveError(result.error);
      }
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!task) return;
    await deleteTask(task.id);
    onDeletedAction(task.id);
    onCloseAction();
  }

  return (
    <>
      {/* Backdrop click-to-dismiss — Escape (géré plus haut) est l'équivalent clavier. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCloseAction();
        }}
      >
        <div className="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
            <h2 className="text-base font-semibold text-foreground">
              {isNew ? 'Nouvelle tâche' : 'Modifier la tâche'}
            </h2>
            <button
              onClick={onCloseAction}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto flex-1">
            <TaskFormFields
              values={values}
              onChangeAction={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
              categories={categories}
              caMembers={caMembers}
              titleRef={titleRef}
            />

            {/* Comments — only in edit mode */}
            {!isNew && task && (
              <TaskComments
                taskId={task.id}
                initialComments={initialComments}
                caMembers={caMembers}
                currentUserId={currentUserId}
              />
            )}
          </div>
          {/* Footer */}
          <div className="flex flex-col gap-2 px-6 py-4 border-t border-border shrink-0">
            {saveError && (
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              {!isNew && !readOnly && (isAdmin || task.created_by === currentUserId) ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 size={14} />
                  Supprimer
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <button
                  onClick={onCloseAction}
                  className="px-4 py-2 rounded-lg text-sm border border-border text-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                {!readOnly && (
                  <button
                    onClick={handleSave}
                    disabled={!values.title.trim() || saving}
                    className="px-4 py-2 rounded-lg text-sm bg-primary text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    {saving ? 'Enregistrement...' : isNew ? 'Créer' : 'Sauvegarder'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && task && (
        <ConfirmModal
          title="Supprimer la tâche"
          message="Cette action est irréversible. La tâche et ses commentaires seront définitivement supprimés."
          confirmLabel="Supprimer"
          danger
          details={{ label: task.title }}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
