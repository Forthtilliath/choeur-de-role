'use client';

import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { sortByOrderIndex } from '@/utils/arrayHelpers';

import { deleteLink, toggleLinkActive, updateLinksOrder } from './clientQueries';
import { LinkForm } from './LinkForm';
import { SortableLink } from './SortableLink';
import type { MemberLink } from './types';
export function LiensAdminClient({ initialLinks }: { initialLinks: MemberLink[] }) {
  const [links, setLinks] = useState<MemberLink[]>(() => sortByOrderIndex(initialLinks));
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<MemberLink | null>(null);
  const confirm = useConfirm();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    const reordered = arrayMove(links, oldIndex, newIndex).map((l, i) => ({
      ...l,
      order_index: i,
    }));
    setLinks(reordered);
    await updateLinksOrder(reordered.map((l) => ({ id: l.id, order_index: l.order_index ?? 0 })));
  }

  function handleSave(link: MemberLink) {
    setLinks((prev) => {
      const exists = prev.find((l) => l.id === link.id);
      return exists ? prev.map((l) => (l.id === link.id ? link : l)) : [...prev, link];
    });
    setShowForm(false);
    setEditingLink(null);
  }

  async function handleToggleActive(link: MemberLink) {
    const ok = await toggleLinkActive(link.id, !link.active);
    if (ok) {
      setLinks((prev) => prev.map((l) => (l.id === link.id ? { ...l, active: !l.active } : l)));
      toast.success(link.active ? 'Lien désactivé' : 'Lien activé');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleDelete(link: MemberLink) {
    if (
      !(await confirm({
        message: 'Supprimer ce lien ?',
        danger: true,
        details: { icon: '🔗', label: link.label, sublabel: link.url },
      }))
    )
      return;
    const ok = await deleteLink(link.id);
    if (ok) {
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      toast.success('Lien supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingLink(null);
            setShowForm(true);
          }}
        >
          + Ajouter un lien
        </Button>
      </div>

      {showForm && (
        <LinkForm
          key={editingLink?.id ?? 'new'}
          link={editingLink}
          onClose={() => {
            setShowForm(false);
            setEditingLink(null);
          }}
          onSave={handleSave}
        />
      )}

      {links.length === 0 && !showForm && (
        <p className="text-center text-foreground/50 py-12">Aucun lien pour le moment.</p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <SortableLink
                key={link.id}
                link={link}
                onEdit={() => {
                  setEditingLink(link);
                  setShowForm(true);
                }}
                onToggleActive={() => handleToggleActive(link)}
                onDelete={() => handleDelete(link)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
