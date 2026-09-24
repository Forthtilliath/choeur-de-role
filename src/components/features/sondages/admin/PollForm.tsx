'use client';

import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';

import { randomId } from '@forthtilliath/ts-kit';

import { Button } from '@/components/ui/Button';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';
import { swapItems } from '@/utils/swapItems';

import type { PollDraft, PollQuestionDraft } from '../types';

import { QuestionCard } from './QuestionCard';
function emptyQuestion(index: number): PollQuestionDraft {
  return {
    key: randomId(),
    text: '',
    type: 'single_choice',
    required: true,
    order_index: index,
    options: [{ key: randomId(), label: '', order_index: 0 }],
  };
}

function emptyDraft(): PollDraft {
  return {
    title: '',
    description: '',
    closes_at: '',
    is_active: true,
    questions: [emptyQuestion(0)],
  };
}

type Props = {
  initialDraft?: PollDraft;
  saving: boolean;
  onSaveAction: (draft: PollDraft) => void;
  onCancelAction: () => void;
};

export function PollForm({ initialDraft, saving, onSaveAction, onCancelAction }: Props) {
  const [draft, setDraft] = useState<PollDraft>(() => initialDraft ?? emptyDraft());
  const formRef = useFormShortcuts(onCancelAction);

  function setMeta<K extends keyof PollDraft>(key: K, value: PollDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function setQuestion(i: number, updates: Partial<PollQuestionDraft>) {
    setDraft((d) => {
      const questions = d.questions.map((q, idx) => (idx === i ? { ...q, ...updates } : q));
      return { ...d, questions };
    });
  }

  function addQuestion() {
    setDraft((d) => ({
      ...d,
      questions: [...d.questions, emptyQuestion(d.questions.length)],
    }));
  }

  function removeQuestion(i: number) {
    setDraft((d) => ({ ...d, questions: d.questions.filter((_, idx) => idx !== i) }));
  }

  function moveQuestion(i: number, dir: -1 | 1) {
    setDraft((d) => {
      const target = i + dir;
      if (target < 0 || target >= d.questions.length) return d;
      return { ...d, questions: swapItems(d.questions, i, target) };
    });
  }

  function setOption(qi: number, oi: number, label: string) {
    setDraft((d) => {
      const questions = d.questions.map((q, idx) => {
        if (idx !== qi) return q;
        const options = q.options.map((o, oidx) => (oidx === oi ? { ...o, label } : o));
        return { ...q, options };
      });
      return { ...d, questions };
    });
  }

  function addOption(qi: number) {
    setDraft((d) => {
      const questions = d.questions.map((q, idx) => {
        if (idx !== qi) return q;
        return {
          ...q,
          options: [...q.options, { key: randomId(), label: '', order_index: q.options.length }],
        };
      });
      return { ...d, questions };
    });
  }

  function removeOption(qi: number, oi: number) {
    setDraft((d) => {
      const questions = d.questions.map((q, idx) => {
        if (idx !== qi) return q;
        return { ...q, options: q.options.filter((_, oidx) => oidx !== oi) };
      });
      return { ...d, questions };
    });
  }

  function reorderOptions(qi: number, from: number, to: number) {
    setDraft((d) => {
      const questions = d.questions.map((q, idx) => {
        if (idx !== qi) return q;
        return { ...q, options: arrayMove(q.options, from, to) };
      });
      return { ...d, questions };
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSaveAction(draft);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Métadonnées */}
      <div className="border border-border rounded-2xl p-5 bg-background-secondary flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">Informations générales</h3>
        <div className="flex flex-col gap-1">
          <label htmlFor="poll-title" className="text-sm font-medium text-foreground">
            Titre *
          </label>
          <input
            id="poll-title"
            value={draft.title}
            onChange={(e) => setMeta('title', e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Sondage de disponibilité..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="poll-description" className="text-sm font-medium text-foreground">
            Description <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <textarea
            id="poll-description"
            value={draft.description}
            onChange={(e) => setMeta('description', e.target.value)}
            rows={2}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background resize-none"
            placeholder="Merci de répondre avant le..."
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-44">
            <label htmlFor="poll-closes-at" className="text-sm font-medium text-foreground">
              Date de clôture <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              id="poll-closes-at"
              type="datetime-local"
              value={draft.closes_at}
              onChange={(e) => setMeta('closes_at', e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer self-end pb-2">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setMeta('is_active', e.target.checked)}
              className="rounded"
            />
            Sondage actif (visible par les choristes)
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="flex flex-col gap-3">
        {draft.questions.map((q, qi) => (
          <QuestionCard
            key={q.key}
            question={q}
            index={qi}
            total={draft.questions.length}
            onUpdate={(updates) => setQuestion(qi, updates)}
            onRemove={() => removeQuestion(qi)}
            onMove={(dir) => moveQuestion(qi, dir)}
            onSetOption={(oi, label) => setOption(qi, oi, label)}
            onAddOption={() => addOption(qi)}
            onRemoveOption={(oi) => removeOption(qi, oi)}
            onReorderOptions={(from, to) => reorderOptions(qi, from, to)}
          />
        ))}
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl py-3 text-sm text-foreground/40 hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une question
        </button>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancelAction}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving} loading={saving}>
          {saving ? 'Sauvegarde...' : initialDraft ? 'Enregistrer' : 'Créer le sondage'}
        </Button>
      </div>
    </form>
  );
}
