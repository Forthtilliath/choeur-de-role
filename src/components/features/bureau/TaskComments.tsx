'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { CaMember, TaskComment } from '@/types/tasks';

import { addComment, deleteComment } from './actions';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function authorInitials(name: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type Props = {
  taskId: string;
  initialComments: TaskComment[];
  caMembers: CaMember[];
  currentUserId: string;
};

// Fil de commentaires d'une tâche ; chacun peut supprimer ses propres commentaires
export function TaskComments({ taskId, initialComments, caMembers, currentUserId }: Props) {
  const [comments, setComments] = useState<TaskComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSavingComment(true);
    const result = await addComment(taskId, newComment.trim());
    if ('ok' in result) {
      const me = caMembers.find((m) => m.id === currentUserId);
      setComments((prev) => [
        ...prev,
        {
          id: result.id,
          task_id: taskId,
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
              {authorInitials(c.author_name)}
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
            {c.author_id === currentUserId && (
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

      {/* Portail : hors du corps scrollable de la modale de tâche, pour ne pas être rogné */}
      {commentToDelete &&
        createPortal(
          <ConfirmModal
            title="Supprimer le commentaire"
            message="Ce commentaire sera définitivement supprimé."
            confirmLabel="Supprimer"
            danger
            onConfirm={handleDeleteComment}
            onCancel={() => setCommentToDelete(null)}
          />,
          document.body,
        )}
    </div>
  );
}
