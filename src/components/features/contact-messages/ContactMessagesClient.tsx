'use client';

import { useState, useMemo, useTransition, useEffect, useRef } from 'react';
import { toggleMessageRead, deleteContactMessage, type ContactMessage } from './actions';

const CATEGORY_LABELS: Record<string, string> = {
  rejoindre: 'Candidature',
  partenariat: 'Partenariat',
  autre: 'Autre',
};

const CATEGORY_COLORS: Record<string, string> = {
  rejoindre: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  partenariat: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  autre: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const UNDO_DELAY = 4000;

type UndoToast = { id: string; prevRead: boolean; label: string };

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

type Props = { messages: ContactMessage[] };

export function ContactMessagesClient({ messages: initial }: Props) {
  const [messages, setMessages] = useState<ContactMessage[]>(initial);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [undoToast, setUndoToast] = useState<UndoToast | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filterCategory && m.category !== filterCategory) return false;
      if (filterRead === 'unread' && m.read) return false;
      if (filterRead === 'read' && !m.read) return false;
      return true;
    });
  }, [messages, filterCategory, filterRead]);

  const unreadCount = messages.filter((m) => !m.read).length;

  function handleToggleRead(msg: ContactMessage) {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const nextRead = !msg.read;

    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: nextRead } : m)));
    setUndoToast({
      id: msg.id,
      prevRead: msg.read,
      label: nextRead ? 'Marqué comme traité' : 'Marqué comme non traité',
    });
    undoTimerRef.current = setTimeout(() => setUndoToast(null), UNDO_DELAY);

    startTransition(() => toggleMessageRead(msg.id, nextRead));
  }

  function handleUndo() {
    if (!undoToast) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const { id, prevRead } = undoToast;
    setUndoToast(null);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: prevRead } : m)));
    startTransition(() => toggleMessageRead(id, prevRead));
  }

  function handleDelete(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setConfirmDelete(null);
    setExpanded((e) => (e === id ? null : e));
    startTransition(() => deleteContactMessage(id));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="flex gap-4 flex-wrap">
        <div className="bg-background-secondary border border-border rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-semibold text-foreground">{messages.length}</p>
          <p className="text-xs text-foreground/50 mt-0.5">Total</p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-semibold text-primary">{unreadCount}</p>
            <p className="text-xs text-primary/70 mt-0.5">Non traité{unreadCount > 1 ? 's' : ''}</p>
          </div>
        )}
        {(['rejoindre', 'partenariat', 'autre'] as const).map((cat) => {
          const count = messages.filter((m) => m.category === cat).length;
          if (!count) return null;
          return (
            <div key={cat} className="bg-background-secondary border border-border rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-semibold text-foreground">{count}</p>
              <p className="text-xs text-foreground/50 mt-0.5">{CATEGORY_LABELS[cat]}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-foreground/50">Catégorie :</span>
          {[null, 'rejoindre', 'partenariat', 'autre'].map((cat) => (
            <button
              key={cat ?? 'all'}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filterCategory === cat
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {cat ? CATEGORY_LABELS[cat] : 'Tous'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-foreground/50">Statut :</span>
          {(['all', 'unread', 'read'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterRead(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filterRead === s
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {s === 'all' ? 'Tous' : s === 'unread' ? 'Non traités' : 'Traités'}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-foreground/40">
        {filtered.length} message{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== messages.length && ` sur ${messages.length}`}
      </p>

      {/* Undo snackbar */}
      {undoToast && (
        <div className="fixed bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.75rem))] left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-foreground text-background px-4 py-3 rounded-xl shadow-lg text-sm">
          <span>{undoToast.label}</span>
          <button
            onClick={handleUndo}
            className="font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Messages */}
      {filtered.length === 0 ? (
        <p className="text-center text-foreground/50 py-12">Aucun message.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className={`border rounded-2xl overflow-hidden transition-all ${
                msg.read ? 'border-border bg-background' : 'border-primary/30 bg-primary/5'
              }`}
            >
              {/* Header row */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                onClick={() => setExpanded((e) => (e === msg.id ? null : msg.id))}
              >
                <span
                  className={`shrink-0 w-2 h-2 rounded-full ${msg.read ? 'bg-transparent border border-border' : 'bg-primary'}`}
                />
                <span
                  className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[msg.category] ?? CATEGORY_COLORS.autre}`}
                >
                  {CATEGORY_LABELS[msg.category] ?? msg.category}
                </span>
                <span className="font-medium text-sm text-foreground truncate">
                  {msg.first_name} {msg.last_name}
                </span>
                <span className="text-xs text-foreground/40 truncate hidden sm:block">{msg.email}</span>
                <span className="ml-auto shrink-0 text-xs text-foreground/40 whitespace-nowrap">
                  {formatDate(msg.created_at)}
                </span>
                <span className="shrink-0 text-foreground/30 text-xs ml-1">
                  {expanded === msg.id ? '▲' : '▼'}
                </span>
              </button>

              {/* Expanded body */}
              {expanded === msg.id && (
                <div className="border-t border-border px-4 py-4 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-foreground/50 text-xs">Email</span>
                      <p>
                        <a href={`mailto:${msg.email}`} className="text-primary hover:opacity-70">
                          {msg.email}
                        </a>
                      </p>
                    </div>
                    {msg.phone && (
                      <div>
                        <span className="text-foreground/50 text-xs">Téléphone</span>
                        <p>{msg.phone}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-foreground/50 text-xs">Message</span>
                    <p className="mt-1 text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <button
                      onClick={() => handleToggleRead(msg)}
                      disabled={isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {msg.read ? 'Marquer non traité' : 'Marquer traité'}
                    </button>
                    {confirmDelete === msg.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          disabled={isPending}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          Confirmer la suppression
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(msg.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
