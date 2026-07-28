'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { submitPollResponse, updatePollResponse } from './clientQueries';
import { Poll, PollAnswer, PollQuestion } from './types';

type Props = {
  poll: Poll;
  memberId: string;
  initialAnswers?: Record<string, PollAnswer[]>;
  isEditing?: boolean;
  onDoneAction: () => void;
  onCancelAction: () => void;
};

export function PollAnswerClient({ poll, memberId, initialAnswers, isEditing = false, onDoneAction, onCancelAction }: Props) {
  const [answers, setAnswers] = useState<Record<string, PollAnswer[]>>(initialAnswers ?? {});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function setSingleChoice(questionId: string, optionId: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [{ question_id: questionId, option_id: optionId, text_value: null, number_value: null }],
    }));
  }

  function toggleMultiChoice(questionId: string, optionId: string) {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      const exists = current.some((a) => a.option_id === optionId);
      return {
        ...prev,
        [questionId]: exists
          ? current.filter((a) => a.option_id !== optionId)
          : [...current, { question_id: questionId, option_id: optionId, text_value: null, number_value: null }],
      };
    });
  }

  function setText(questionId: string, text: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [{ question_id: questionId, option_id: null, text_value: text, number_value: null }],
    }));
  }

  function setRating(questionId: string, value: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: [{ question_id: questionId, option_id: null, text_value: null, number_value: value }],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    // Validate required
    for (const q of poll.poll_questions) {
      if (!q.required) continue;
      const ans = answers[q.id] ?? [];
      if (ans.length === 0) {
        setError(`Veuillez répondre à la question "${q.text}".`);
        return;
      }
      if (q.type === 'text' && !ans[0]?.text_value?.trim()) {
        setError(`Veuillez répondre à la question "${q.text}".`);
        return;
      }
    }

    setSubmitting(true);
    const allAnswers = Object.values(answers).flat();
    const ok = isEditing
      ? await updatePollResponse(poll.id, memberId, allAnswers)
      : await submitPollResponse(poll.id, memberId, allAnswers);
    setSubmitting(false);
    if (ok) {
      onDoneAction();
    } else {
      setError('Une erreur est survenue, veuillez réessayer.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{poll.title}</h2>
        {poll.description && (
          <p className="text-sm text-foreground/60 mt-1">{poll.description}</p>
        )}
        {poll.closes_at && (
          <p className="text-xs text-foreground/40 mt-1">
            Clôture le {new Date(poll.closes_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {poll.poll_questions.map((q, i) => (
        <QuestionInput
          key={q.id}
          question={q}
          index={i}
          currentAnswers={answers[q.id] ?? []}
          onSingleChoice={(optId) => setSingleChoice(q.id, optId)}
          onMultiChoice={(optId) => toggleMultiChoice(q.id, optId)}
          onText={(txt) => setText(q.id, txt)}
          onRating={(val) => setRating(q.id, val)}
        />
      ))}

      {error && (
        <p className="text-sm text-danger bg-danger/10 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="ghost" onClick={onCancelAction}>
          Annuler
        </Button>
        <Button type="submit" disabled={submitting} loading={submitting}>
          {submitting ? 'Envoi...' : isEditing ? 'Modifier mes réponses' : 'Soumettre mes réponses'}
        </Button>
      </div>
    </form>
  );
}

type QuestionInputProps = {
  question: PollQuestion;
  index: number;
  currentAnswers: PollAnswer[];
  onSingleChoice: (optId: string) => void;
  onMultiChoice: (optId: string) => void;
  onText: (txt: string) => void;
  onRating: (val: number) => void;
};

function QuestionInput({ question, index, currentAnswers, onSingleChoice, onMultiChoice, onText, onRating }: QuestionInputProps) {
  const selectedOptionIds = currentAnswers.map((a) => a.option_id).filter(Boolean) as string[];
  const textValue = currentAnswers[0]?.text_value ?? '';
  const ratingValue = currentAnswers[0]?.number_value ?? 0;

  return (
    <div className="border border-border rounded-2xl p-4 bg-background-secondary flex flex-col gap-3">
      <div>
        <p className="text-xs text-foreground/40 mb-0.5">Question {index + 1}{question.required ? ' *' : ''}</p>
        <p className="text-sm font-medium text-foreground">{question.text}</p>
        {question.type === 'multiple_choice' && (
          <p className="text-xs text-foreground/40 mt-0.5">Plusieurs choix possibles</p>
        )}
      </div>

      {question.type === 'single_choice' && (
        <div className="flex flex-col gap-2">
          {question.poll_options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selectedOptionIds.includes(opt.id) ? 'border-primary bg-primary' : 'border-border group-hover:border-primary/50'}`}>
                {selectedOptionIds.includes(opt.id) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
              <input type="radio" name={`q-${question.id}`} value={opt.id} checked={selectedOptionIds.includes(opt.id)} onChange={() => onSingleChoice(opt.id)} className="sr-only" />
              <span className="text-sm text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'multiple_choice' && (
        <div className="flex flex-col gap-2">
          {question.poll_options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${selectedOptionIds.includes(opt.id) ? 'border-primary bg-primary' : 'border-border group-hover:border-primary/50'}`}>
                {selectedOptionIds.includes(opt.id) && (
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <input type="checkbox" value={opt.id} checked={selectedOptionIds.includes(opt.id)} onChange={() => onMultiChoice(opt.id)} className="sr-only" />
              <span className="text-sm text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <textarea
          value={textValue}
          onChange={(e) => onText(e.target.value)}
          rows={3}
          className="border border-border rounded-lg px-4 py-2.5 text-sm bg-background resize-none w-full"
          placeholder="Votre réponse..."
        />
      )}

      {question.type === 'rating' && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRating(n)}
              className={`w-10 h-10 rounded-xl border-2 text-sm font-semibold transition-all ${
                ratingValue === n
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-foreground/50 hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
