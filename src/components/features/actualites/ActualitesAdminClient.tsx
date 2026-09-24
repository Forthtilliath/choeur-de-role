'use client';

import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { useDndSensors } from '@/hooks/useDndSensors';
import { sortByOrderIndex } from '@/utils/arrayHelpers';

import {
  deleteNews,
  toggleNewsPinned,
  toggleNewsPublished,
  updateNewsOrder,
} from './clientQueries';
import { NewsForm } from './NewsForm';
import { SortableNewsItem } from './SortableNewsItem';
import type { News } from './types';
export function ActualitesAdminClient({ initialNews }: { initialNews: News[] }) {
  const [news, setNews] = useState<News[]>(() => sortByOrderIndex(initialNews));
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const confirm = useConfirm();
  const sensors = useDndSensors();

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = news.findIndex((n) => n.id === active.id);
    const newIndex = news.findIndex((n) => n.id === over.id);
    const reordered = arrayMove(news, oldIndex, newIndex).map((n, i) => ({ ...n, order_index: i }));
    setNews(reordered);
    await updateNewsOrder(reordered.map((n) => ({ id: n.id, order_index: n.order_index ?? 0 })));
  }

  async function handleTogglePublish(item: News) {
    const isPublishing = !item.published;
    const ok = await toggleNewsPublished(item.id, isPublishing);
    if (ok) {
      setNews((prev) =>
        prev.map((n) =>
          n.id === item.id
            ? { ...n, published: isPublishing, scheduled_at: isPublishing ? null : n.scheduled_at }
            : n,
        ),
      );
      toast.success(isPublishing ? 'Actualité publiée' : 'Actualité dépubliée');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleTogglePin(item: News) {
    const ok = await toggleNewsPinned(item.id, !item.pinned);
    if (ok) {
      setNews((prev) => prev.map((n) => (n.id === item.id ? { ...n, pinned: !n.pinned } : n)));
      toast.success(item.pinned ? 'Actualité désépinglée' : 'Actualité épinglée');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleDelete(id: string) {
    const item = news.find((n) => n.id === id);
    if (
      !(await confirm({
        message: 'Supprimer cette actualité ?',
        danger: true,
        details: item ? { icon: '📰', label: item.title } : undefined,
      }))
    )
      return;
    const ok = await deleteNews(id);
    if (ok) {
      setNews((prev) => prev.filter((n) => n.id !== id));
      toast.success('Actualité supprimée');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleSave(item: News) {
    const isCreation = !editingNews;
    setNews((prev) => {
      const exists = prev.find((n) => n.id === item.id);
      return exists
        ? prev.map((n) => (n.id === item.id ? item : n))
        : [...prev, { ...item, order_index: prev.length }];
    });
    if (isCreation) {
      setEditingNews(item);
    } else {
      setShowForm(false);
      setEditingNews(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingNews(null);
            setShowForm(true);
          }}
        >
          + Ajouter une actualité
        </Button>
      </div>

      {showForm && (
        <NewsForm
          key={editingNews?.id ?? 'new'}
          news={editingNews}
          totalNews={news.length}
          onClose={() => {
            setShowForm(false);
            setEditingNews(null);
          }}
          onSave={handleSave}
        />
      )}

      {news.length === 0 && !showForm && (
        <p className="text-center text-foreground/50 py-12">Aucune actualité pour le moment.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={news.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {news.map((item) => (
              <SortableNewsItem
                key={item.id}
                item={item}
                onEdit={() => {
                  setEditingNews(item);
                  setShowForm(true);
                }}
                onTogglePin={() => handleTogglePin(item)}
                onTogglePublish={() => handleTogglePublish(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
