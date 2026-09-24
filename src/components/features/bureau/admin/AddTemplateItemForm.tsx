'use client';

import { useState } from 'react';

import { DurationInput } from '@/components/ui/DurationInput';
import { Select } from '@/components/ui/Select';
import type {
  DurationUnit,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  TaskTemplateItem,
} from '@/types/tasks';

import { addTemplateItem } from '../templateActions';

import { PRIORITY_KEYS, PRIORITY_LABELS, STATUS_KEYS, STATUS_LABELS } from './templateLabels';

const INPUT_CLASS =
  'border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors';

type Props = {
  templateId: string;
  categories: TaskCategory[];
  nextPosition: number;
  onAddedAction: (item: TaskTemplateItem) => void;
};

export function AddTemplateItemForm({
  templateId,
  categories,
  nextPosition,
  onAddedAction,
}: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo');
  const [newDurationValue, setNewDurationValue] = useState<number | null>(null);
  const [newDurationUnit, setNewDurationUnit] = useState<DurationUnit | null>(null);
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  function resetForm() {
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setNewStatus('todo');
    setNewDurationValue(null);
    setNewDurationUnit(null);
    setNewCategoryId(null);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    setAddError('');
    const result = await addTemplateItem(templateId, {
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      priority: newPriority,
      status: newStatus,
      duration_value: newDurationValue,
      duration_unit: newDurationUnit,
      category_id: newCategoryId,
    });
    if ('error' in result) {
      setAddError(result.error);
    } else {
      onAddedAction({
        id: result.id,
        template_id: templateId,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        priority: newPriority,
        status: newStatus,
        duration_value: newDurationValue,
        duration_unit: newDurationUnit,
        category_id: newCategoryId,
        category: categories.find((c) => c.id === newCategoryId) ?? null,
        position: nextPosition,
      });
      resetForm();
    }
    setAdding(false);
  }

  return (
    <form
      onSubmit={handleAddItem}
      className="rounded-xl border border-dashed border-border p-4 flex flex-col gap-3"
    >
      <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">
        Ajouter une tâche type
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Titre de la tâche..."
          className={INPUT_CLASS}
        />
        <Select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
          className="px-2"
        >
          {PRIORITY_KEYS.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <Select
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
          className="px-2"
        >
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <DurationInput
          value={newDurationValue}
          unit={newDurationUnit}
          onChangeAction={(v, u) => {
            setNewDurationValue(v);
            setNewDurationUnit(u);
          }}
        />
        <Select
          value={newCategoryId ?? ''}
          onChange={(e) => setNewCategoryId(e.target.value || null)}
          className="px-2"
        >
          <option value="">— Catégorie —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <input
        value={newDesc}
        onChange={(e) => setNewDesc(e.target.value)}
        placeholder="Description (optionnel)"
        className={INPUT_CLASS}
      />
      {addError && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          {addError}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!newTitle.trim() || adding}
          className="px-4 py-2 rounded-lg text-sm bg-primary text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {adding ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}
