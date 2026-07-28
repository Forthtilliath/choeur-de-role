'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DurationInput } from '@/components/ui/DurationInput';
import { Select } from '@/components/ui/Select';
import {
  addTemplateItem,
  deleteTemplateItem,
  reorderTemplateItems,
  updateTemplate,
  updateTemplateItem,
} from '../templateActions';
import type { DurationUnit, TaskCategory, TaskPriority, TaskStatus, TaskTemplate, TaskTemplateItem } from '@/types/tasks';

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  on_hold: 'En attente',
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
};

type Props = {
  template: TaskTemplate;
  initialItems: TaskTemplateItem[];
  categories: TaskCategory[];
};

export function TemplateEditor({ template, initialItems, categories }: Props) {
  const router = useRouter();
  const [templateName, setTemplateName] = useState(template.name);
  const [templateDesc, setTemplateDesc] = useState(template.description ?? '');
  const [savingMeta, setSavingMeta] = useState(false);

  const [items, setItems] = useState<TaskTemplateItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<TaskTemplateItem | null>(null);

  // New item form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo');
  const [newDurationValue, setNewDurationValue] = useState<number | null>(null);
  const [newDurationUnit, setNewDurationUnit] = useState<DurationUnit | null>(null);
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  async function handleSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    if (!templateName.trim()) return;
    setSavingMeta(true);
    await updateTemplate(template.id, {
      name: templateName.trim(),
      description: templateDesc.trim() || null,
    });
    setSavingMeta(false);
    router.refresh();
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    setAddError('');
    const result = await addTemplateItem(template.id, {
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
      const newItem: TaskTemplateItem = {
        id: result.id,
        template_id: template.id,
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        priority: newPriority,
        status: newStatus,
        duration_value: newDurationValue,
        duration_unit: newDurationUnit,
        category_id: newCategoryId,
        category: categories.find((c) => c.id === newCategoryId) ?? null,
        position: (items[items.length - 1]?.position ?? 0) + 1000,
      };
      setItems((prev) => [...prev, newItem]);
      setNewTitle('');
      setNewDesc('');
      setNewPriority('medium');
      setNewStatus('todo');
      setNewDurationValue(null);
      setNewDurationUnit(null);
      setNewCategoryId(null);
    }
    setAdding(false);
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const newItems = [...items];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
    const updates = newItems.map((item, i) => ({ id: item.id, position: (i + 1) * 1000 }));
    setItems(newItems.map((item, i) => ({ ...item, position: (i + 1) * 1000 })));
    await reorderTemplateItems(updates);
  }

  async function handleInlineUpdate(item: TaskTemplateItem, field: keyof TaskTemplateItem, value: string) {
    const updated = { ...item, [field]: value };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await updateTemplateItem(item.id, { [field]: value });
  }

  async function handleDurationUpdate(item: TaskTemplateItem, value: number | null, unit: DurationUnit | null) {
    const updated = { ...item, duration_value: value, duration_unit: unit };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await updateTemplateItem(item.id, { duration_value: value, duration_unit: unit });
  }

  async function handleCategoryUpdate(item: TaskTemplateItem, categoryId: string | null) {
    const cat = categories.find((c) => c.id === categoryId) ?? null;
    const updated = { ...item, category_id: categoryId, category: cat };
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    await updateTemplateItem(item.id, { category_id: categoryId });
  }

  async function handleDelete() {
    if (!toDelete) return;
    await deleteTemplateItem(toDelete.id);
    setItems((prev) => prev.filter((i) => i.id !== toDelete.id));
    setToDelete(null);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <Link
        href="/choristes/admin/bureau/templates"
        className="flex items-center gap-1 text-sm text-foreground/50 hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft size={14} />
        Templates
      </Link>

      {/* Meta */}
      <section className="rounded-2xl border border-border bg-background p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">Informations du template</h2>
        <form onSubmit={handleSaveMeta} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Nom *</label>
              <input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Description</label>
              <input
                value={templateDesc}
                onChange={(e) => setTemplateDesc(e.target.value)}
                placeholder="Description optionnelle"
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!templateName.trim() || savingMeta}
              className="px-4 py-2 rounded-lg text-sm bg-primary text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {savingMeta ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </section>

      {/* Items */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          Tâches types{' '}
          <span className="text-foreground/40 font-normal">({items.length})</span>
        </h2>

        {items.length === 0 && (
          <p className="text-sm text-foreground/40 italic text-center py-6">
            Aucune tâche. Ajoutez-en ci-dessous.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 group"
            >
              {/* Reorder */}
              <div className="flex flex-col shrink-0">
                <button
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="text-foreground/20 hover:text-foreground/60 disabled:opacity-0 transition-colors"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  onClick={() => handleMove(index, 1)}
                  disabled={index === items.length - 1}
                  className="text-foreground/20 hover:text-foreground/60 disabled:opacity-0 transition-colors"
                >
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 min-w-0">
                {editingId === item.id ? (
                  <input
                    autoFocus
                    defaultValue={item.title}
                    onBlur={(e) => {
                      handleInlineUpdate(item, 'title', e.target.value || item.title);
                      setEditingId(null);
                    }}
                    className="border border-primary rounded-md px-2 py-1 text-sm bg-background text-foreground focus:outline-none"
                  />
                ) : (
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="text-sm text-foreground text-left truncate hover:text-primary transition-colors"
                  >
                    {item.title}
                  </button>
                )}
                <Select
                  value={item.priority}
                  onChange={(e) => handleInlineUpdate(item, 'priority', e.target.value)}
                  className="text-xs rounded-md px-2 py-1"
                >
                  {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                  ))}
                </Select>
                <Select
                  value={item.status}
                  onChange={(e) => handleInlineUpdate(item, 'status', e.target.value)}
                  className="text-xs rounded-md px-2 py-1"
                >
                  {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </Select>
                <DurationInput
                  value={item.duration_value}
                  unit={item.duration_unit}
                  onChangeAction={(v, u) => handleDurationUpdate(item, v, u)}
                />
                <Select
                  value={item.category_id ?? ''}
                  onChange={(e) => handleCategoryUpdate(item, e.target.value || null)}
                  className="text-xs rounded-md px-2 py-1"
                >
                  <option value="">— Catégorie —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>

              <button
                onClick={() => setToDelete(item)}
                className="shrink-0 text-foreground/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Add item */}
        <form onSubmit={handleAddItem} className="rounded-xl border border-dashed border-border p-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">Ajouter une tâche type</p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titre de la tâche..."
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <Select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              className="px-2"
            >
              {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
              ))}
            </Select>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
              className="px-2"
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </Select>
            <DurationInput
              value={newDurationValue}
              unit={newDurationUnit}
              onChangeAction={(v, u) => { setNewDurationValue(v); setNewDurationUnit(u); }}
            />
            <Select
              value={newCategoryId ?? ''}
              onChange={(e) => setNewCategoryId(e.target.value || null)}
              className="px-2"
            >
              <option value="">— Catégorie —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optionnel)"
            className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors"
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
      </section>

      {toDelete && (
        <ConfirmModal
          title="Supprimer cette tâche type"
          message="Cette tâche sera retirée du template. Les tâches déjà créées dans les projets ne sont pas affectées."
          confirmLabel="Supprimer"
          danger
          details={{ label: toDelete.title }}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
