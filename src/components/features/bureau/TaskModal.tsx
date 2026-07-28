'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DurationInput } from '@/components/ui/DurationInput';
import { Select } from '@/components/ui/Select';
import type { CaMember, DurationUnit, Task, TaskCategory, TaskComment, TaskPriority, TaskStatus } from '@/types/tasks';
import { addComment, createTask, deleteComment, deleteTask, updateTask } from './actions';

const PRIORITIES: { id: TaskPriority; label: string; className: string; activeClassName: string }[] = [
  {
    id: 'low',
    label: 'Basse',
    className: 'border-border text-foreground/50 hover:border-foreground/30',
    activeClassName: 'border-foreground/40 bg-foreground/8 text-foreground',
  },
  {
    id: 'medium',
    label: 'Moyenne',
    className: 'border-amber-200 text-amber-600 hover:border-amber-400 dark:border-amber-800 dark:text-amber-400',
    activeClassName: 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
  {
    id: 'high',
    label: 'Haute',
    className: 'border-red-200 text-red-500 hover:border-red-400 dark:border-red-800 dark:text-red-400',
    activeClassName: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  },
];

function initials(firstName: string | null, lastName: string | null) {
  return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

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

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? initialPriority ?? 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [durationValue, setDurationValue] = useState<number | null>(task?.duration_value ?? null);
  const [durationUnit, setDurationUnit] = useState<DurationUnit | null>(task?.duration_unit ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(task?.category_id ?? null);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    task?.assignees.map((a) => a.member_id) ?? [],
  );
  const [comments, setComments] = useState<TaskComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseAction();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCloseAction]);

  function toggleAssignee(memberId: string) {
    setAssigneeIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setSaveError('');

    if (isNew) {
      const result = await createTask({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        duration_value: durationValue,
        duration_unit: durationUnit,
        category_id: categoryId,
        status: initialStatus,
        assignee_ids: assigneeIds,
      });
      if ('ok' in result) {
        const now = new Date().toISOString();
        const newTask: Task = {
          id: result.id,
          title: title.trim(),
          description: description.trim() || null,
          status: initialStatus,
          priority,
          due_date: dueDate || null,
          duration_value: durationValue,
          duration_unit: durationUnit,
          category_id: categoryId,
          category: categories.find((c) => c.id === categoryId) ?? null,
          position: 0,
          project_id: projectId,
          created_by: currentUserId,
          created_at: now,
          updated_at: now,
          assignees: caMembers
            .filter((m) => assigneeIds.includes(m.id))
            .map((m) => ({ member_id: m.id, first_name: m.first_name, last_name: m.last_name })),
        };
        onSavedAction(newTask);
        onCloseAction();
      } else {
        setSaveError(result.error);
      }
    } else {
      const result = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        due_date: dueDate || null,
        duration_value: durationValue,
        duration_unit: durationUnit,
        category_id: categoryId,
        assignee_ids: assigneeIds,
      });
      if ('ok' in result) {
        const updatedTask: Task = {
          ...task,
          title: title.trim(),
          description: description.trim() || null,
          priority,
          due_date: dueDate || null,
          duration_value: durationValue,
          duration_unit: durationUnit,
          category_id: categoryId,
          category: categories.find((c) => c.id === categoryId) ?? null,
          updated_at: new Date().toISOString(),
          assignees: caMembers
            .filter((m) => assigneeIds.includes(m.id))
            .map((m) => ({ member_id: m.id, first_name: m.first_name, last_name: m.last_name })),
        };
        onSavedAction(updatedTask);
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

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    setSavingComment(true);
    const result = await addComment(task.id, newComment.trim());
    if ('ok' in result) {
      const me = caMembers.find((m) => m.id === currentUserId);
      setComments((prev) => [
        ...prev,
        {
          id: result.id,
          task_id: task.id,
          author_id: currentUserId,
          author_name: me ? `${me.first_name ?? ''} ${me.last_name ?? ''}`.trim() || null : null,
          content: newComment.trim(),
          created_at: new Date().toISOString(),
        },
      ]);
      setNewComment('');
    }
    setSavingComment(false);
  }

  async function handleDeleteComment() {
    if (!commentToDelete) return;
    await deleteComment(commentToDelete);
    setComments((prev) => prev.filter((c) => c.id !== commentToDelete));
    setCommentToDelete(null);
  }

  return (
    <>
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
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Titre</label>
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titre de la tâche"
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails, contexte, liens utiles..."
                rows={3}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Priority + Due date + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Priorité</label>
                <div className="flex gap-1.5">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
                      className={`flex-1 py-1.5 text-xs font-medium border rounded-lg transition-all ${
                        priority === p.id ? p.activeClassName : p.className
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                  Échéance
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Duration + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                  Durée estimée
                </label>
                <DurationInput
                  value={durationValue}
                  unit={durationUnit}
                  onChangeAction={(v, u) => { setDurationValue(v); setDurationUnit(u); }}
                />
              </div>
              {categories.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                    Catégorie
                  </label>
                  <Select
                    value={categoryId ?? ''}
                    onChange={(e) => setCategoryId(e.target.value || null)}
                    wrapperClassName="w-full"
                  >
                    <option value="">— Aucune —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>
              )}
            </div>

            {/* Assignees */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Assignés</label>
              <div className="flex flex-wrap gap-1.5">
                {caMembers.map((member) => {
                  const isSelected = assigneeIds.includes(member.id);
                  const name = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim();
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleAssignee(member.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary/40 text-primary'
                          : 'border-border text-foreground/60 hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? 'bg-primary text-white' : 'bg-foreground/10 text-foreground/60'}`}>
                        {initials(member.first_name, member.last_name)}
                      </span>
                      {name || 'Inconnu'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments — only in edit mode */}
            {!isNew && task && (
              <div className="flex flex-col gap-3 border-t border-border pt-5">
                <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">
                  Commentaires ({comments.length})
                </label>

                {comments.length === 0 && (
                  <p className="text-xs text-foreground/40 italic">Aucun commentaire pour l&apos;instant.</p>
                )}

                <div className="flex flex-col gap-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5 group/comment">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {c.author_name
                          ? c.author_name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
                          : '?'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {c.author_name ?? 'Inconnu'}
                          </span>
                          <span className="text-[10px] text-foreground/40">{formatDate(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{c.content}</p>
                      </div>
                      {(c.author_id === currentUserId) && (
                        <button
                          onClick={() => setCommentToDelete(c.id)}
                          className="shrink-0 opacity-0 group-hover/comment:opacity-100 transition-opacity text-foreground/30 hover:text-red-500"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ajouter un commentaire..."
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim() || savingComment}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    {savingComment ? '...' : 'Envoyer'}
                  </button>
                </form>
              </div>
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
                  disabled={!title.trim() || saving}
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

      {commentToDelete && (
        <ConfirmModal
          title="Supprimer le commentaire"
          message="Ce commentaire sera définitivement supprimé."
          confirmLabel="Supprimer"
          danger
          onConfirm={handleDeleteComment}
          onCancel={() => setCommentToDelete(null)}
        />
      )}
    </>
  );
}
