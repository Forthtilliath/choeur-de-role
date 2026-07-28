'use client';

import {
  DndContext,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PollDraft, PollOptionDraft, PollQuestionDraft, QuestionType } from '../types';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';
import { useDndSensors } from '@/hooks/useDndSensors';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single_choice', label: 'Choix unique' },
  { value: 'multiple_choice', label: 'Choix multiple' },
  { value: 'text', label: 'Réponse libre' },
  { value: 'rating', label: 'Note (1–5)' },
];

function emptyQuestion(index: number): PollQuestionDraft {
  return {
    text: '',
    type: 'single_choice',
    required: true,
    order_index: index,
    options: [{ label: '', order_index: 0 }],
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
  const [draft, setDraft] = useState<PollDraft>(initialDraft ?? emptyDraft());
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
      const qs = [...d.questions];
      const target = i + dir;
      if (target < 0 || target >= qs.length) return d;
      [qs[i], qs[target]] = [qs[target], qs[i]];
      return { ...d, questions: qs };
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
          options: [...q.options, { label: '', order_index: q.options.length }],
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
          <label className="text-sm font-medium text-foreground">Titre *</label>
          <input
            value={draft.title}
            onChange={(e) => setMeta('title', e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Sondage de disponibilité..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Description <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={draft.description}
            onChange={(e) => setMeta('description', e.target.value)}
            rows={2}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background resize-none"
            placeholder="Merci de répondre avant le..."
          />
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-44">
            <label className="text-sm font-medium text-foreground">
              Date de clôture <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
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
            key={qi}
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

type QuestionCardProps = {
  question: PollQuestionDraft;
  index: number;
  total: number;
  onUpdate: (u: Partial<PollQuestionDraft>) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onSetOption: (oi: number, label: string) => void;
  onAddOption: () => void;
  onRemoveOption: (oi: number) => void;
  onReorderOptions: (from: number, to: number) => void;
};

function QuestionCard({
  question,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
  onSetOption,
  onAddOption,
  onRemoveOption,
  onReorderOptions,
}: QuestionCardProps) {
  const hasOptions = question.type === 'single_choice' || question.type === 'multiple_choice';
  const sensors = useDndSensors();

  function handleOptionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = question.options.findIndex((_, i) => optionId(question.options[i], i) === active.id);
    const to = question.options.findIndex((_, i) => optionId(question.options[i], i) === over.id);
    if (from !== -1 && to !== -1) onReorderOptions(from, to);
  }

  function optionId(opt: PollOptionDraft, i: number): string {
    return opt.id ?? `new-${i}`;
  }

  return (
    <div className="border border-border rounded-2xl p-4 bg-background-secondary flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-0.5 mt-0.5">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="text-foreground/30 hover:text-foreground/60 disabled:opacity-20 disabled:cursor-not-allowed p-0.5 leading-none"
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="text-foreground/30 hover:text-foreground/60 disabled:opacity-20 disabled:cursor-not-allowed p-0.5 leading-none"
          >
            ▼
          </button>
        </div>
        <span className="text-xs font-semibold text-foreground/40 mt-1.5 shrink-0">
          Q{index + 1}
        </span>
        <input
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          required
          className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
          placeholder="Texte de la question..."
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={total === 1}
          className="text-foreground/30 hover:text-danger disabled:opacity-20 disabled:cursor-not-allowed p-1 mt-0.5"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Type + required */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-0.5">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                const hasOpts = t.value === 'single_choice' || t.value === 'multiple_choice';
                onUpdate({
                  type: t.value,
                  options: hasOpts && question.options.length === 0
                    ? [{ label: '', order_index: 0 }]
                    : question.options,
                });
              }}
              className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${
                question.type === t.value
                  ? 'bg-foreground text-background font-medium'
                  : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-foreground/60 cursor-pointer">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded"
          />
          Obligatoire
        </label>
      </div>

      {/* Options (choix) */}
      {hasOptions && (
        <div className="flex flex-col gap-2 pl-6">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOptionDragEnd}>
            <SortableContext
              items={question.options.map((o, i) => optionId(o, i))}
              strategy={verticalListSortingStrategy}
            >
              {question.options.map((opt, oi) => (
                <SortableOption
                  key={optionId(opt, oi)}
                  id={optionId(opt, oi)}
                  opt={opt}
                  index={oi}
                  canRemove={question.options.length > 1}
                  onChange={(label) => onSetOption(oi, label)}
                  onRemove={() => onRemoveOption(oi)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <button
            type="button"
            onClick={onAddOption}
            className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors pl-5.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une option
          </button>
        </div>
      )}

      {question.type === 'rating' && (
        <p className="text-xs text-foreground/40 pl-6">
          Les choristes noteront de 1 à 5.
        </p>
      )}
    </div>
  );
}

type SortableOptionProps = {
  id: string;
  opt: PollOptionDraft;
  index: number;
  canRemove: boolean;
  onChange: (label: string) => void;
  onRemove: () => void;
};

function SortableOption({ id, opt, index, canRemove, onChange, onRemove }: SortableOptionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-foreground/25 hover:text-foreground/50 cursor-grab active:cursor-grabbing touch-none"
        tabIndex={-1}
      >
        <GripVertical className="w-3.5 h-3.5 shrink-0" />
      </button>
      <input
        value={opt.label}
        onChange={(e) => onChange(e.target.value)}
        required
        className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
        placeholder={`Option ${index + 1}...`}
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="text-foreground/30 hover:text-danger disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
