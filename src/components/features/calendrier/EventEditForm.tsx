'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';

import { insertRecurringEvents, updateSeriesEvents, upsertCalendarEvent } from './clientQueries';
import type { SeriesScope } from './EventFormControls';
import { RecurringToggle, SeriesScopeField } from './EventFormControls';
import { EventTypeSelect } from './EventTypeSelect';
import { LocationMap } from './LocationMap';
import type { RecurrenceSettings } from './recurrence';
import {
  buildRecurringRows,
  DEFAULT_RECURRENCE,
  generateRecurringDates,
  toDatetimeLocal,
} from './recurrence';
import { RecurrenceFields } from './RecurrenceFields';
import type { CalendarEvent, EventType } from './types';

const INPUT_CLASS = 'border border-border rounded-lg px-3 py-2 text-sm bg-background';

// Début/fin par défaut : ceux de l'évènement, sinon 20h–22h le jour cliqué
function defaultDatetime(
  event: CalendarEvent | null,
  day: Date | undefined,
  field: 'start' | 'end',
) {
  if (event) return toDatetimeLocal(new Date(field === 'start' ? event.starts_at : event.ends_at));
  if (!day) return '';
  const hour = field === 'start' ? 20 : 22;
  return toDatetimeLocal(new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0));
}

type Props = {
  event: CalendarEvent | null;
  eventTypes: EventType[];
  eventTypeId: string;
  onEventTypeChangeAction: (id: string) => void;
  defaultDay?: Date;
  onCloseAction: () => void;
  onSaveAction: (event: CalendarEvent, seriesUpdated?: boolean) => void;
  onDeleteAction?: (id: string) => void;
  onDirtyChangeAction?: (dirty: boolean) => void;
};

export function EventEditForm({
  event,
  eventTypes,
  eventTypeId,
  onEventTypeChangeAction,
  defaultDay,
  onCloseAction,
  onSaveAction,
  onDeleteAction,
  onDirtyChangeAction,
}: Props) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [startsAt, setStartsAt] = useState(() => defaultDatetime(event, defaultDay, 'start'));
  const [endsAt, setEndsAt] = useState(() => defaultDatetime(event, defaultDay, 'end'));
  const [location, setLocation] = useState(event?.location ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [seriesScope, setSeriesScope] = useState<SeriesScope>('single');
  const [recurrence, setRecurrence] = useState<RecurrenceSettings>(DEFAULT_RECURRENCE);
  const formRef = useFormShortcuts(onCloseAction);

  const dirty = () => onDirtyChangeAction?.(true);
  const selectedType = eventTypes.find((et) => et.id === eventTypeId);
  const previewCount = isRecurring ? generateRecurringDates(recurrence).length : 0;

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setSaving(true);
    onDirtyChangeAction?.(false);
    const base = {
      title,
      event_type_id: eventTypeId,
      location: location || null,
      description: description || null,
    };

    if (isRecurring && !event) {
      const dates = generateRecurringDates(recurrence);
      if (dates.length === 0) {
        setSaving(false);
        return;
      }
      const created = await insertRecurringEvents(buildRecurringRows(dates, recurrence, base));
      if (created.length > 0) {
        created.forEach((ev) => onSaveAction(ev));
        const s = created.length > 1 ? 's' : '';
        toast.success(`${created.length} évènement${s} créé${s}`);
      } else {
        toast.error('Aucun évènement créé');
      }
      setSaving(false);
      return;
    }

    const payload = {
      ...base,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
    };

    const saved = await upsertCalendarEvent(payload, event?.id);
    if (saved) {
      if (seriesScope === 'following' && event?.series_id) {
        await updateSeriesEvents(event.series_id, event.starts_at, base);
        onSaveAction(saved, true);
      } else {
        onSaveAction(saved);
      }
      toast.success(event ? 'Évènement modifié' : 'Évènement ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
      {/* Portée (série) */}
      {event?.series_id && <SeriesScopeField value={seriesScope} onChangeAction={setSeriesScope} />}

      {/* Type */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-foreground/50">Type</span>
        <EventTypeSelect
          eventTypes={eventTypes}
          value={eventTypeId}
          onChange={(id) => {
            onEventTypeChangeAction(id);
            dirty();
          }}
        />
      </div>

      {/* Titre */}
      <div className="flex flex-col gap-1">
        <label htmlFor="calendar-event-title" className="text-xs text-foreground/50">
          Titre
        </label>
        <input
          id="calendar-event-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            dirty();
          }}
          required
          className={INPUT_CLASS}
          placeholder={selectedType?.label ?? 'Titre...'}
        />
      </div>

      {/* Lieu */}
      <div className="flex flex-col gap-1">
        <label htmlFor="calendar-event-location" className="text-xs text-foreground/50">
          Lieu <span className="text-foreground/30">(optionnel)</span>
        </label>
        <input
          id="calendar-event-location"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            dirty();
          }}
          className={INPUT_CLASS}
          placeholder="Salle de répétition..."
        />
        {location && <LocationMap location={location} />}
      </div>

      {/* Toggle récurrence */}
      {!event && (
        <RecurringToggle
          checked={isRecurring}
          onToggleAction={() => {
            setIsRecurring(!isRecurring);
            dirty();
          }}
        />
      )}

      {/* Évènement unique */}
      {!isRecurring && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="calendar-event-starts-at" className="text-xs text-foreground/50">
              Début
            </label>
            <input
              id="calendar-event-starts-at"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => {
                setStartsAt(e.target.value);
                dirty();
              }}
              required
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="calendar-event-ends-at" className="text-xs text-foreground/50">
              Fin
            </label>
            <input
              id="calendar-event-ends-at"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => {
                setEndsAt(e.target.value);
                dirty();
              }}
              required
              className={INPUT_CLASS}
            />
          </div>
        </div>
      )}

      {/* Récurrence */}
      {isRecurring && (
        <RecurrenceFields
          value={recurrence}
          onChangeAction={(patch) => setRecurrence((prev) => ({ ...prev, ...patch }))}
          previewCount={previewCount}
        />
      )}

      {/* Note */}
      <div className="flex flex-col gap-1">
        <label htmlFor="calendar-event-description" className="text-xs text-foreground/50">
          Note <span className="text-foreground/30">(optionnel)</span>
        </label>
        <textarea
          id="calendar-event-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            dirty();
          }}
          rows={2}
          className={`${INPUT_CLASS} resize-y`}
          placeholder="Informations complémentaires..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-between pt-1">
        {event && onDeleteAction && (
          <button
            type="button"
            onClick={() => onDeleteAction(event.id)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Supprimer
          </button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button type="button" variant="ghost" size="sm" onClick={onCloseAction}>
            Annuler
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving
              ? 'Sauvegarde...'
              : event
                ? 'Modifier'
                : isRecurring
                  ? `Créer${previewCount > 0 ? ` (${previewCount})` : ''}`
                  : 'Ajouter'}
          </Button>
        </div>
      </div>
    </form>
  );
}
