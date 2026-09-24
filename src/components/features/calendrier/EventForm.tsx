'use client';

import { useState } from 'react';

import { EventEditForm } from './EventEditForm';
import { EventReadOnlyView } from './EventReadOnlyView';
import type { CalendarEvent, EventType } from './types';

type Props = {
  event: CalendarEvent | null;
  eventTypes: EventType[];
  defaultDay?: Date;
  onCloseAction: () => void;
  onSaveAction: (event: CalendarEvent, seriesUpdated?: boolean) => void;
  onDeleteAction?: (id: string) => void;
  canEdit: boolean;
  onDirtyChangeAction?: (dirty: boolean) => void;
};

// Fenêtre d'évènement : en-tête teinté par le type, puis lecture seule ou formulaire d'édition
export function EventForm({
  event,
  eventTypes,
  defaultDay,
  onCloseAction,
  onSaveAction,
  onDeleteAction,
  canEdit,
  onDirtyChangeAction,
}: Props) {
  const [eventTypeId, setEventTypeId] = useState(event?.event_type_id ?? eventTypes[0]?.id ?? '');
  const isBirthday = event?.id.startsWith('birthday-') ?? false;

  const selectedType = eventTypes.find((et) => et.id === eventTypeId);
  const dialogColor = event?.event_types.color ?? selectedType?.color;

  return (
    <div className="border border-foreground/50 rounded-2xl bg-background shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
      {/* Header coloré */}
      <div
        className="p-3 flex items-center justify-between shrink-0 transition-colors duration-200"
        style={dialogColor ? { backgroundColor: `${dialogColor}25` } : {}}
      >
        <h2 className="text-base font-medium text-foreground">
          {isBirthday
            ? 'Anniversaire'
            : event
              ? canEdit
                ? "Modifier l'évènement"
                : "Détail de l'évènement"
              : 'Nouvel évènement'}
        </h2>
        <button
          type="button"
          onClick={onCloseAction}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-foreground/30 hover:border-foreground/70 text-foreground/60 hover:text-foreground transition-colors text-sm"
        >
          ✕
        </button>
      </div>
      <div className="px-6 pb-6 overflow-y-auto">
        {/* Lecture seule */}
        {(isBirthday || !canEdit) && event && (
          <EventReadOnlyView event={event} isBirthday={isBirthday} onCloseAction={onCloseAction} />
        )}

        {canEdit && !isBirthday && (
          <EventEditForm
            event={event}
            eventTypes={eventTypes}
            eventTypeId={eventTypeId}
            onEventTypeChangeAction={setEventTypeId}
            defaultDay={defaultDay}
            onCloseAction={onCloseAction}
            onSaveAction={onSaveAction}
            onDeleteAction={onDeleteAction}
            onDirtyChangeAction={onDirtyChangeAction}
          />
        )}
      </div>
    </div>
  );
}
