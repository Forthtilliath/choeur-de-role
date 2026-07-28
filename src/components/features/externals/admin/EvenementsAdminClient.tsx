'use client';

import { useEffect, useRef, useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { deleteEvent, toggleEventPublished } from '../clientQueries';
import { ExternalEvent } from '../types';
import { EventForm } from './EventForm';
import { EventRow } from './EventRow';

export function EvenementsAdminClient({
  initialEvents,
  editEventId,
}: {
  initialEvents: ExternalEvent[];
  editEventId?: string;
}) {
  const [events, setEvents] = useState<ExternalEvent[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<ExternalEvent | null>(
    editEventId ? (initialEvents.find((e) => e.id === editEventId) ?? null) : null,
  );
  const [showForm, setShowForm] = useState(!!editEventId);
  const formRef = useRef<HTMLDivElement>(null);
  const confirm = useConfirm();

  useEffect(() => {
    if (editEventId && formRef.current) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave(event: ExternalEvent) {
    setEvents((prev) => {
      const exists = prev.find((e) => e.id === event.id);
      return exists ? prev.map((e) => (e.id === event.id ? event : e)) : [event, ...prev];
    });
    setShowForm(false);
    setEditingEvent(null);
  }

  const now = new Date();

  const sortedEvents = [...events].sort((a, b) => {
    const aDate = a.external_event_dates[0]?.date ?? '';
    const bDate = b.external_event_dates[0]?.date ?? '';
    return aDate.localeCompare(bDate);
  });

  const upcoming = sortedEvents.filter((e) =>
    e.external_event_dates.some((d) => new Date(d.date) >= now),
  );
  const past = sortedEvents.filter((e) =>
    e.external_event_dates.every((d) => new Date(d.date) < now),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingEvent(null);
            setShowForm(true);
          }}
        >
          + Ajouter un évènement
        </Button>
      </div>

      {showForm && (
        <div ref={formRef}>
          <EventForm
            key={editingEvent?.id ?? 'new'}
            event={editingEvent}
            onCloseAction={() => {
              setShowForm(false);
              setEditingEvent(null);
            }}
            onSaveAction={handleSave}
          />
        </div>
      )}

      {events.length === 0 && !showForm && (
        <p className="text-center text-foreground/50 py-12">Aucun évènement pour le moment.</p>
      )}

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">À venir</p>
          {upcoming.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onEdit={() => {
                setEditingEvent(event);
                setShowForm(true);
              }}
              onDelete={async () => {
                if (!await confirm({
                  message: 'Supprimer cet évènement ?',
                  danger: true,
                  details: { icon: '📅', label: event.title },
                })) return;
                const ok = await deleteEvent(event.id);
                if (ok) {
                  setEvents((prev) => prev.filter((e) => e.id !== event.id));
                  toast.success('Évènement supprimé');
                } else {
                  toast.error('Erreur lors de la suppression');
                }
              }}
              onTogglePublish={async () => {
                const ok = await toggleEventPublished(event.id, !event.published);
                if (ok) {
                  setEvents((prev) =>
                    prev.map((e) => (e.id === event.id ? { ...e, published: !e.published } : e)),
                  );
                  toast.success(event.published ? 'Évènement dépublié' : 'Évènement publié');
                } else {
                  toast.error('Erreur lors de la mise à jour');
                }
              }}
            />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <p className="text-xs font-medium text-foreground/50 uppercase tracking-wide">Passés</p>
          {past.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onEdit={() => {
                setEditingEvent(event);
                setShowForm(true);
              }}
              onDelete={async () => {
                if (!await confirm({
                  message: 'Supprimer cet évènement ?',
                  danger: true,
                  details: { icon: '📅', label: event.title },
                })) return;
                const ok = await deleteEvent(event.id);
                if (ok) {
                  setEvents((prev) => prev.filter((e) => e.id !== event.id));
                  toast.success('Évènement supprimé');
                } else {
                  toast.error('Erreur lors de la suppression');
                }
              }}
              onTogglePublish={async () => {
                const ok = await toggleEventPublished(event.id, !event.published);
                if (ok) {
                  setEvents((prev) =>
                    prev.map((e) => (e.id === event.id ? { ...e, published: !e.published } : e)),
                  );
                  toast.success(event.published ? 'Évènement dépublié' : 'Évènement publié');
                } else {
                  toast.error('Erreur lors de la mise à jour');
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
