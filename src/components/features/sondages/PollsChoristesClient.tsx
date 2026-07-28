'use client';

import { CheckCircle, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PollAnswerClient } from './PollAnswerClient';
import { getMyPollAnswers, getPoll } from './queries.client';
import { Poll, PollAnswer, PollSummary } from './types';

type Props = {
  polls: PollSummary[];
  memberId: string;
};

type View =
  | { type: 'list' }
  | { type: 'answer'; poll: Poll; initialAnswers: Record<string, PollAnswer[]>; isEditing: boolean };

function isPollOpen(poll: PollSummary) {
  if (!poll.is_active) return false;
  if (!poll.closes_at) return true;
  return new Date(poll.closes_at) > new Date();
}

export function PollsChoristesClient({ polls: initialPolls, memberId }: Props) {
  const [polls, setPolls] = useState<PollSummary[]>(initialPolls);
  const [view, setView] = useState<View>({ type: 'list' });
  const [loading, setLoading] = useState<string | null>(null);

  async function handleOpen(pollId: string) {
    setLoading(pollId);
    try {
      const poll = await getPoll(pollId);
      setView({ type: 'answer', poll, initialAnswers: {}, isEditing: false });
    } finally {
      setLoading(null);
    }
  }

  async function handleEdit(pollId: string) {
    setLoading(pollId);
    try {
      const [poll, initialAnswers] = await Promise.all([
        getPoll(pollId),
        getMyPollAnswers(pollId, memberId),
      ]);
      setView({ type: 'answer', poll, initialAnswers, isEditing: true });
    } finally {
      setLoading(null);
    }
  }

  function handleDone(pollId: string) {
    setPolls((prev) =>
      prev.map((p) => (p.id === pollId ? { ...p, has_responded: true } : p)),
    );
    setView({ type: 'list' });
  }

  if (view.type === 'answer') {
    return (
      <PollAnswerClient
        poll={view.poll}
        memberId={memberId}
        initialAnswers={view.initialAnswers}
        isEditing={view.isEditing}
        onDoneAction={() => handleDone(view.poll.id)}
        onCancelAction={() => setView({ type: 'list' })}
      />
    );
  }

  const open = polls.filter((p) => !p.has_responded);
  const done = polls.filter((p) => p.has_responded);

  return (
    <div className="flex flex-col gap-6">
      {polls.length === 0 && (
        <div className="text-center py-16 text-foreground/40">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucun sondage actif pour le moment.</p>
        </div>
      )}

      {open.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">
            En attente de votre réponse
          </h2>
          {open.map((p) => (
            <PollCard key={p.id} poll={p} loading={loading === p.id} onOpen={() => handleOpen(p.id)} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wide">
            Déjà répondus
          </h2>
          {done.map((p) => (
            <PollCard
              key={p.id}
              poll={p}
              loading={loading === p.id}
              onOpen={() => {}}
              onEdit={isPollOpen(p) ? () => handleEdit(p.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PollCard({
  poll,
  loading,
  onOpen,
  onEdit,
}: {
  poll: PollSummary;
  loading: boolean;
  onOpen: () => void;
  onEdit?: () => void;
}) {
  return (
    <div className="border border-border rounded-2xl p-4 bg-background-secondary flex items-start gap-4">
      <div className="mt-0.5 shrink-0">
        {poll.has_responded ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <ClipboardList className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{poll.title}</p>
        {poll.description && (
          <p className="text-xs text-foreground/50 mt-0.5 line-clamp-2">{poll.description}</p>
        )}
        {poll.closes_at && (
          <p className="text-xs text-foreground/40 mt-1">
            Clôture le{' '}
            {new Date(poll.closes_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
        <p className="text-xs text-foreground/30 mt-0.5">
          {poll.response_count} réponse{poll.response_count !== 1 ? 's' : ''}
        </p>
      </div>
      {!poll.has_responded && (
        <Button size="sm" onClick={onOpen} disabled={loading}>
          {loading ? '...' : 'Répondre'}
        </Button>
      )}
      {poll.has_responded && onEdit && (
        <Button size="sm" variant="outline" onClick={onEdit} disabled={loading}>
          {loading ? '...' : 'Modifier'}
        </Button>
      )}
    </div>
  );
}
