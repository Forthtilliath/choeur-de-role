'use client';

import { BarChart2, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import {
  createPoll,
  deletePoll,
  togglePollActive,
  updatePoll,
} from '../clientQueries';
import { getPollResults } from '../queries.client';
import { Poll, PollDraft, PollResults } from '../types';
import { PollForm } from './PollForm';
import dynamic from 'next/dynamic';

const PollResultsClient = dynamic(() => import('./PollResultsClient').then(m => m.PollResultsClient), { ssr: false });

type View = { type: 'list' } | { type: 'form'; poll: Poll | null } | { type: 'results'; results: PollResults };

type Props = {
  initialPolls: Poll[];
  memberId: string;
};

export function PollsAdminClient({ initialPolls, memberId }: Props) {
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [view, setView] = useState<View>({ type: 'list' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const confirm = useConfirm();

  async function handleSave(draft: PollDraft) {
    setSaving(true);
    try {
      const editing = view.type === 'form' ? view.poll : null;
      if (editing) {
        const existingIds = editing.poll_questions.map((q) => q.id);
        const ok = await updatePoll(editing.id, draft, existingIds);
        if (ok) {
          window.location.reload();
        } else {
          toast.error('Erreur lors de la modification du sondage');
        }
      } else {
        const newId = await createPoll(draft, memberId);
        if (newId) {
          window.location.reload();
        } else {
          toast.error('Erreur lors de la création du sondage');
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const item = polls.find((p) => p.id === id);
    if (!await confirm({
      message: 'Supprimer ce sondage ? Toutes les réponses seront perdues.',
      danger: true,
      details: item ? { icon: '📊', label: item.title } : undefined,
    })) return;
    const ok = await deletePoll(id);
    if (ok) {
      setPolls((prev) => prev.filter((p) => p.id !== id));
      toast.success('Sondage supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  async function handleToggleActive(id: string, current: boolean) {
    const ok = await togglePollActive(id, !current);
    if (ok) {
      setPolls((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !current } : p)));
      toast.success(current ? 'Sondage désactivé' : 'Sondage activé');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleViewResults(pollId: string) {
    setLoading(pollId);
    try {
      const results = await getPollResults(pollId);
      setView({ type: 'results', results });
    } finally {
      setLoading(null);
    }
  }

  if (view.type === 'form') {
    const editingPoll = view.poll;
    const initialDraft: PollDraft | undefined = editingPoll
      ? {
          title: editingPoll.title,
          description: editingPoll.description ?? '',
          closes_at: editingPoll.closes_at?.slice(0, 16) ?? '',
          is_active: editingPoll.is_active,
          questions: editingPoll.poll_questions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required,
            order_index: q.order_index,
            options: q.poll_options.map((o) => ({
              id: o.id,
              label: o.label,
              order_index: o.order_index,
            })),
          })),
        }
      : undefined;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setView({ type: 'list' })}
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            ← Retour
          </button>
          <h2 className="text-base font-semibold text-foreground">
            {editingPoll ? 'Modifier le sondage' : 'Nouveau sondage'}
          </h2>
        </div>
        <PollForm
          initialDraft={initialDraft}
          saving={saving}
          onSaveAction={handleSave}
          onCancelAction={() => setView({ type: 'list' })}
        />
      </div>
    );
  }

  if (view.type === 'results') {
    return (
      <PollResultsClient
        results={view.results}
        onBackAction={() => setView({ type: 'list' })}
      />
    );
  }

  // List view
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setView({ type: 'form', poll: null })}>
          + Nouveau sondage
        </Button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-16 text-foreground/40">
          <p>Aucun sondage pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {polls.map((poll) => (
            <div
              key={poll.id}
              className="border border-border rounded-2xl p-4 bg-background-secondary flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{poll.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        poll.is_active
                          ? 'bg-green-700 text-white'
                          : 'bg-muted text-foreground/40'
                      }`}
                    >
                      {poll.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  {poll.description && (
                    <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">{poll.description}</p>
                  )}
                  <p className="text-xs text-foreground/40 mt-1">
                    {poll.poll_questions.length} question{poll.poll_questions.length !== 1 ? 's' : ''}
                    {poll.closes_at && ` · Clôture le ${new Date(poll.closes_at).toLocaleDateString('fr-FR')}`}
                  </p>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => handleViewResults(poll.id)}
                  disabled={loading === poll.id}
                >
                  <BarChart2 className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline">
                    {loading === poll.id ? 'Chargement...' : 'Résultats'}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleActive(poll.id, poll.is_active)}
                >
                  {poll.is_active ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 sm:hidden" />
                      <span className="hidden sm:inline">Désactiver</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 sm:hidden" />
                      <span className="hidden sm:inline">Activer</span>
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setView({ type: 'form', poll })}
                >
                  <Edit className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline">Modifier</span>
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(poll.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline">Supprimer</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
