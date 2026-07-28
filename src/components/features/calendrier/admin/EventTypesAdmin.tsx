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
import { useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { deleteEventType, updateEventTypesOrder, upsertEventType } from '../clientQueries';
import { EventType } from '../types';
import { useDndSensors } from '@/hooks/useDndSensors';

type RowProps = {
  et: EventType;
  onEdit: (et: EventType) => void;
  onDelete: (id: string) => void;
};

function SortableRow({ et, onEdit, onDelete }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: et.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 p-3 rounded-xl border border-border bg-background ${isDragging ? 'opacity-50 shadow-lg z-10' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-foreground/60 px-1 touch-none select-none"
      >
        ⠿
      </button>
      <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: et.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{et.label}</p>
        {(et.description || et.is_special) && (
          <p className="text-xs text-foreground/40 truncate">
            {[et.description, et.is_special ? 'Spécial' : null].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={() => onEdit(et)}>
          <span className="hidden sm:inline">Modifier</span>
          <span className="sm:hidden">✎</span>
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(et.id)}>
          <span className="hidden sm:inline">Supprimer</span>
          <span className="sm:hidden">✕</span>
        </Button>
      </div>
    </div>
  );
}

export function EventTypesAdmin({ initialEventTypes }: { initialEventTypes: EventType[] }) {
  const [eventTypes, setEventTypes] = useState<EventType[]>(initialEventTypes);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<EventType | null>(null);
  const confirm = useConfirm();

  const sensors = useDndSensors();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setEventTypes((prev) => {
      const oldIdx = prev.findIndex((et) => et.id === active.id);
      const newIdx = prev.findIndex((et) => et.id === over.id);
      const next = arrayMove(prev, oldIdx, newIdx).map((et, i) => ({ ...et, order_index: i }));
      updateEventTypesOrder(next.map((et) => ({ id: et.id, order_index: et.order_index ?? 0 })));
      return next;
    });
  }

  async function handleDelete(id: string) {
    if (!await confirm({ message: 'Supprimer ce type ? Les évènements liés seront aussi supprimés.', danger: true })) return;
    const ok = await deleteEventType(id);
    if (ok) {
      setEventTypes((prev) => prev.filter((et) => et.id !== id));
      toast.success('Type d\'évènement supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleSave(eventType: EventType) {
    setEventTypes((prev) => {
      const exists = prev.find((et) => et.id === eventType.id);
      return exists
        ? prev.map((et) => (et.id === eventType.id ? eventType : et))
        : [...prev, eventType];
    });
    setShowForm(false);
    setEditingType(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingType(null);
            setShowForm(true);
          }}
        >
          + Ajouter un type
        </Button>
      </div>

      {showForm && (
        <EventTypeForm
          key={editingType?.id ?? 'new'}
          eventType={editingType}
          totalTypes={eventTypes.length}
          onClose={() => {
            setShowForm(false);
            setEditingType(null);
          }}
          onSave={handleSave}
        />
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={eventTypes.map((et) => et.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-3">
            {eventTypes.map((et) => (
              <SortableRow
                key={et.id}
                et={et}
                onEdit={(e) => {
                  setEditingType(e);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function EventTypeForm({
  eventType,
  totalTypes,
  onClose,
  onSave,
}: {
  eventType: EventType | null;
  totalTypes: number;
  onClose: () => void;
  onSave: (et: EventType) => void;
}) {
  const [label, setLabel] = useState(eventType?.label ?? '');
  const [color, setColor] = useState(eventType?.color ?? '#22c55e');
  const [isSpecial, setIsSpecial] = useState(eventType?.is_special ?? false);
  const [description, setDescription] = useState(eventType?.description ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const saved = await upsertEventType(
      { label, color, is_special: isSpecial, description: description || null },
      eventType?.id,
      totalTypes,
    );
    if (saved) {
      onSave(saved);
      toast.success(eventType ? 'Type modifié' : 'Type ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-4 text-foreground">
        {eventType ? 'Modifier le type' : 'Nouveau type'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Répétition"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Description <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background resize-none"
            placeholder="Quand utiliser ce type d'évènement..."
          />
        </div>
        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-foreground">Couleur</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-background"
              />
              <span className="text-sm text-foreground/60">{color}</span>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={isSpecial}
              onChange={(e) => setIsSpecial(e.target.checked)}
              className="rounded"
            />
            Évènement spécial
          </label>
        </div>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : eventType ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
