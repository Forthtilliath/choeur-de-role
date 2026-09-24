'use client';

import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';
import { useDndSensors } from '@/hooks/useDndSensors';

import { deletePartner, togglePartnerActive, updatePartnersOrder } from './clientQueries';
import { PartnerForm } from './PartnerForm';
import { SortablePartnerRow } from './SortablePartnerRow';
import type { Partner } from './types';
export function PartenairesAdminClient({ initialPartners }: { initialPartners: Partner[] }) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const confirm = useConfirm();

  const sensors = useDndSensors();

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = partners.findIndex((p) => p.id === active.id);
    const newIndex = partners.findIndex((p) => p.id === over.id);
    const newPartners = arrayMove(partners, oldIndex, newIndex).map((p, i) => ({
      ...p,
      order_index: i,
    }));
    setPartners(newPartners);
    await updatePartnersOrder(
      newPartners.map((p) => ({ id: p.id, order_index: p.order_index ?? 0 })),
    );
  }

  async function confirmDirty(): Promise<boolean> {
    if (!isDirty) return true;
    return confirm({ message: 'Vous avez des modifications non sauvegardées. Les abandonner ?' });
  }

  async function openNew() {
    if (!(await confirmDirty())) return;
    setIsDirty(false);
    setEditingPartner(null);
    setShowForm(true);
  }

  async function openEdit(partner: Partner) {
    if (!(await confirmDirty())) return;
    setIsDirty(false);
    setEditingPartner(partner);
    setShowForm(true);
  }

  async function closeForm() {
    if (!(await confirmDirty())) return;
    setShowForm(false);
    setEditingPartner(null);
    setIsDirty(false);
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openNew}>+ Ajouter un sponsor</Button>
      </div>

      {showForm && (
        <PartnerForm
          key={editingPartner?.id ?? 'new'}
          partner={editingPartner}
          onClose={closeForm}
          onDirtyChange={setIsDirty}
          onSave={(partner) => {
            setPartners((prev) => {
              const exists = prev.find((p) => p.id === partner.id);
              return exists
                ? prev.map((p) => (p.id === partner.id ? partner : p))
                : [...prev, partner];
            });
            setShowForm(false);
            setEditingPartner(null);
            setIsDirty(false);
          }}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={partners.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {partners.map((partner) => (
              <SortablePartnerRow
                key={partner.id}
                partner={partner}
                onEdit={() => openEdit(partner)}
                onToggleActive={async () => {
                  const ok = await togglePartnerActive(partner.id, !partner.active);
                  if (ok) {
                    setPartners((prev) =>
                      prev.map((p) => (p.id === partner.id ? { ...p, active: !p.active } : p)),
                    );
                    toast.success(partner.active ? 'Sponsor désactivé' : 'Sponsor activé');
                  } else {
                    toast.error('Erreur lors de la mise à jour');
                  }
                }}
                onDelete={async () => {
                  if (
                    !(await confirm({
                      message: 'Supprimer ce partenaire ?',
                      danger: true,
                      details: { icon: '🤝', label: partner.name },
                    }))
                  )
                    return;
                  const ok = await deletePartner(partner.id);
                  if (ok) {
                    setPartners((prev) => prev.filter((p) => p.id !== partner.id));
                    toast.success('Sponsor supprimé');
                  } else {
                    toast.error('Erreur lors de la suppression');
                  }
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {partners.length === 0 && (
        <p className="text-center text-foreground/50 py-12">Aucun sponsor pour le moment.</p>
      )}
    </div>
  );
}
