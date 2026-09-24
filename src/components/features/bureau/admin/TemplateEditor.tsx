'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { swapItems } from '@forthtilliath/ts-kit';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { DurationUnit, TaskCategory, TaskTemplate, TaskTemplateItem } from '@/types/tasks';

import { deleteTemplateItem, reorderTemplateItems, updateTemplateItem } from '../templateActions';

import { AddTemplateItemForm } from './AddTemplateItemForm';
import { TemplateItemRow } from './TemplateItemRow';
import { TemplateMetaForm } from './TemplateMetaForm';

type Props = {
  template: TaskTemplate;
  initialItems: TaskTemplateItem[];
  categories: TaskCategory[];
};

export function TemplateEditor({ template, initialItems, categories }: Props) {
  const [items, setItems] = useState<TaskTemplateItem[]>(initialItems);
  const [toDelete, setToDelete] = useState<TaskTemplateItem | null>(null);

  async function handleMove(index: number, direction: -1 | 1) {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= items.length) return;
    const newItems = swapItems(items, index, swapIndex);
    const updates = newItems.map((item, i) => ({ id: item.id, position: (i + 1) * 1000 }));
    setItems(newItems.map((item, i) => ({ ...item, position: (i + 1) * 1000 })));
    await reorderTemplateItems(updates);
  }

  function replaceItem(updated: TaskTemplateItem) {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  async function handleInlineUpdate(
    item: TaskTemplateItem,
    field: keyof TaskTemplateItem,
    value: string,
  ) {
    replaceItem({ ...item, [field]: value });
    await updateTemplateItem(item.id, { [field]: value });
  }

  async function handleDurationUpdate(
    item: TaskTemplateItem,
    value: number | null,
    unit: DurationUnit | null,
  ) {
    replaceItem({ ...item, duration_value: value, duration_unit: unit });
    await updateTemplateItem(item.id, { duration_value: value, duration_unit: unit });
  }

  async function handleCategoryUpdate(item: TaskTemplateItem, categoryId: string | null) {
    const cat = categories.find((c) => c.id === categoryId) ?? null;
    replaceItem({ ...item, category_id: categoryId, category: cat });
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

      <TemplateMetaForm template={template} />

      {/* Items */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          Tâches types <span className="text-foreground/40 font-normal">({items.length})</span>
        </h2>

        {items.length === 0 && (
          <p className="text-sm text-foreground/40 italic text-center py-6">
            Aucune tâche. Ajoutez-en ci-dessous.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <TemplateItemRow
              key={item.id}
              item={item}
              categories={categories}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onMoveAction={(direction) => handleMove(index, direction)}
              onFieldUpdateAction={(field, value) => handleInlineUpdate(item, field, value)}
              onDurationUpdateAction={(v, u) => handleDurationUpdate(item, v, u)}
              onCategoryUpdateAction={(categoryId) => handleCategoryUpdate(item, categoryId)}
              onDeleteAction={() => setToDelete(item)}
            />
          ))}
        </div>

        <AddTemplateItemForm
          templateId={template.id}
          categories={categories}
          nextPosition={(items[items.length - 1]?.position ?? 0) + 1000}
          onAddedAction={(item) => setItems((prev) => [...prev, item])}
        />
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
