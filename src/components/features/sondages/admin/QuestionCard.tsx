'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Trash2 } from 'lucide-react';

import { randomId } from '@forthtilliath/ts-kit';

import { useDndSensors } from '@/hooks/useDndSensors';

import type { PollQuestionDraft, QuestionType } from '../types';

import { SortableOption } from './SortableOption';

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'single_choice', label: 'Choix unique' },
  { value: 'multiple_choice', label: 'Choix multiple' },
  { value: 'text', label: 'Réponse libre' },
  { value: 'rating', label: 'Note (1–5)' },
];

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

export function QuestionCard({
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
    const from = question.options.findIndex((opt) => opt.key === active.id);
    const to = question.options.findIndex((opt) => opt.key === over.id);
    if (from !== -1 && to !== -1) onReorderOptions(from, to);
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
                  options:
                    hasOpts && question.options.length === 0
                      ? [{ key: randomId(), label: '', order_index: 0 }]
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleOptionDragEnd}
          >
            <SortableContext
              items={question.options.map((o) => o.key)}
              strategy={verticalListSortingStrategy}
            >
              {question.options.map((opt, oi) => (
                <SortableOption
                  key={opt.key}
                  id={opt.key}
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
        <p className="text-xs text-foreground/40 pl-6">Les choristes noteront de 1 à 5.</p>
      )}
    </div>
  );
}
