'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { insertRecurringEvents, updateSeriesEvents, upsertCalendarEvent } from './clientQueries';
import { CalendarEvent, EventType } from './types';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';
import Image from 'next/image';
import { LocationMap } from './LocationMap';
import { formatEventDateRange } from '@/utils/dateHelpers';

function EventTypeSelect({
  eventTypes,
  value,
  onChange,
}: {
  eventTypes: EventType[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = eventTypes.find((et) => et.id === value);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground hover:border-primary/50 focus:outline-none focus:border-primary transition-colors"
      >
        <span className="w-2.5 h-2.5 rounded-full shrink-0 transition-colors" style={{ backgroundColor: selected?.color }} />
        <span className="flex-1 text-left">{selected?.label}</span>
        <ChevronDown size={14} className={`text-foreground/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          {eventTypes.map((et) => (
            <button
              key={et.id}
              type="button"
              onClick={() => { onChange(et.id); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-background-secondary ${et.id === value ? 'bg-background-tertiary font-medium text-foreground' : 'text-foreground/70'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: et.color }} />
              {et.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');
const toDatetimeLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

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
  const defaultStart = event
    ? toDatetimeLocal(new Date(event.starts_at))
    : defaultDay
      ? toDatetimeLocal(
          new Date(defaultDay.getFullYear(), defaultDay.getMonth(), defaultDay.getDate(), 20, 0),
        )
      : '';
  const defaultEnd = event
    ? toDatetimeLocal(new Date(event.ends_at))
    : defaultDay
      ? toDatetimeLocal(
          new Date(defaultDay.getFullYear(), defaultDay.getMonth(), defaultDay.getDate(), 22, 0),
        )
      : '';

  const [title, setTitle] = useState(event?.title ?? '');
  const [eventTypeId, setEventTypeId] = useState(event?.event_type_id ?? eventTypes[0]?.id ?? '');
  const [startsAt, setStartsAt] = useState(defaultStart);
  const [endsAt, setEndsAt] = useState(defaultEnd);
  const [location, setLocation] = useState(event?.location ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [seriesScope, setSeriesScope] = useState<'single' | 'following'>('single');
  const formRef = useFormShortcuts(onCloseAction);
  const [recurDay, setRecurDay] = useState(1);
  const [recurStartTime, setRecurStartTime] = useState('20:00');
  const [recurEndTime, setRecurEndTime] = useState('22:00');
  const [recurFrom, setRecurFrom] = useState('');
  const [recurTo, setRecurTo] = useState('');
  const [recurExclusions, setRecurExclusions] = useState('');

  const WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const dirty = () => onDirtyChangeAction?.(true);
  const isBirthday = event?.id.startsWith('birthday-');

  function generateRecurringDates(): Date[] {
    if (!recurFrom || !recurTo) return [];
    const from = new Date(recurFrom);
    const to = new Date(recurTo);
    const exclusions = recurExclusions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const dates: Date[] = [];
    const current = new Date(from);

    while (true) {
      const jsDay = current.getDay();
      const isoDay = jsDay === 0 ? 7 : jsDay;
      if (isoDay === recurDay) break;
      current.setDate(current.getDate() + 1);
    }

    while (current <= to) {
      const dateStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`;
      if (!exclusions.includes(dateStr)) dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    return dates;
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setSaving(true);
    onDirtyChangeAction?.(false);

    if (isRecurring && !event) {
      const dates = generateRecurringDates();
      if (dates.length === 0) {
        setSaving(false);
        return;
      }

      const [startH, startM] = recurStartTime.split(':').map(Number);
      const [endH, endM] = recurEndTime.split(':').map(Number);
      const seriesId = crypto.randomUUID();

      const rows = dates.map((d) => {
        const starts = new Date(d);
        starts.setHours(startH, startM, 0, 0);
        const ends = new Date(d);
        ends.setHours(endH, endM, 0, 0);
        return {
          title,
          event_type_id: eventTypeId,
          starts_at: starts.toISOString(),
          ends_at: ends.toISOString(),
          location: location || null,
          description: description || null,
          series_id: seriesId,
        };
      });

      const created = await insertRecurringEvents(rows);
      if (created.length > 0) {
        created.forEach((ev) => onSaveAction(ev));
        toast.success(`${created.length} évènement${created.length > 1 ? 's' : ''} créé${created.length > 1 ? 's' : ''}`);
      } else {
        toast.error('Aucun évènement créé');
      }
      setSaving(false);
      return;
    }

    const payload = {
      title,
      event_type_id: eventTypeId,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: new Date(endsAt).toISOString(),
      location: location || null,
      description: description || null,
    };

    const saved = await upsertCalendarEvent(payload, event?.id);
    if (saved) {
      if (seriesScope === 'following' && event?.series_id) {
        await updateSeriesEvents(event.series_id, event.starts_at, {
          title,
          event_type_id: eventTypeId,
          location: location || null,
          description: description || null,
        });
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

  const previewCount = isRecurring ? generateRecurringDates().length : 0;
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
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-start gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                {!isBirthday && <p className="text-xs text-foreground/50">{event.event_types.label}</p>}
                <p className="text-xs text-foreground/60">
                  {formatEventDateRange(event.starts_at, event.ends_at)}
                </p>
              </div>
              {isBirthday && event.photo_url && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-border">
                  <Image
                    src={event.photo_url}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
              )}
            </div>
            {event.location && <LocationMap location={event.location} />}
            {event.description && (
              <p className="text-sm text-foreground/70 mt-2 whitespace-pre-line">{event.description}</p>
            )}
            <Button
              onClick={onCloseAction}
              variant="ghost"
              className="mt-4 text-sm text-foreground/50 hover:text-foreground"
            >
              Fermer
            </Button>
          </div>
        )}

        {canEdit && !isBirthday && (
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            {/* Portée (série) */}
            {event?.series_id && (
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-background-secondary border border-border">
                <p className="text-xs font-medium text-foreground/50">Portée des modifications</p>
                {(['single', 'following'] as const).map((scope) => (
                  <label key={scope} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="seriesScope"
                      value={scope}
                      checked={seriesScope === scope}
                      onChange={() => setSeriesScope(scope)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-foreground">
                      {scope === 'single'
                        ? 'Cet évènement seulement'
                        : 'Cet évènement et les suivants'}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Type</label>
              <EventTypeSelect
                eventTypes={eventTypes}
                value={eventTypeId}
                onChange={(id) => { setEventTypeId(id); dirty(); }}
              />
            </div>

            {/* Titre */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Titre</label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  dirty();
                }}
                required
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                placeholder={selectedType?.label ?? 'Titre...'}
              />
            </div>

            {/* Lieu */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">
                Lieu <span className="text-foreground/30">(optionnel)</span>
              </label>
              <input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  dirty();
                }}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                placeholder="Salle de répétition..."
              />
              {location && <LocationMap location={location} />}
            </div>

            {/* Toggle récurrence */}
            {!event && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isRecurring}
                  aria-label="Répétition récurrente"
                  onClick={() => {
                    setIsRecurring(!isRecurring);
                    dirty();
                  }}
                  className={`w-9 h-5 rounded-full transition-colors relative ${isRecurring ? 'bg-primary' : 'bg-border'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isRecurring ? 'translate-x-4' : 'translate-x-0'}`}
                  />
                </button>
                <span className="text-sm text-foreground/70">Répétition récurrente</span>
              </div>
            )}

            {/* Évènement unique */}
            {!isRecurring && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-foreground/50">Début</label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => {
                      setStartsAt(e.target.value);
                      dirty();
                    }}
                    required
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-foreground/50">Fin</label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => {
                      setEndsAt(e.target.value);
                      dirty();
                    }}
                    required
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                  />
                </div>
              </div>
            )}

            {/* Récurrence */}
            {isRecurring && (
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-background-secondary border border-border">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-foreground/50">Jour de la semaine</label>
                  <div className="flex flex-wrap gap-1">
                    {WEEKDAYS.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRecurDay(idx + 1)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${recurDay === idx + 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-foreground/50">Heure de début</label>
                    <input
                      type="time"
                      value={recurStartTime}
                      onChange={(e) => setRecurStartTime(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-foreground/50">Heure de fin</label>
                    <input
                      type="time"
                      value={recurEndTime}
                      onChange={(e) => setRecurEndTime(e.target.value)}
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-foreground/50">Du</label>
                    <input
                      type="date"
                      value={recurFrom}
                      onChange={(e) => setRecurFrom(e.target.value)}
                      required
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-foreground/50">Au</label>
                    <input
                      type="date"
                      value={recurTo}
                      onChange={(e) => setRecurTo(e.target.value)}
                      required
                      className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-foreground/50">
                    Dates à exclure{' '}
                    <span className="text-foreground/30">(AAAA-MM-JJ, séparées par virgules)</span>
                  </label>
                  <input
                    value={recurExclusions}
                    onChange={(e) => setRecurExclusions(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background"
                    placeholder="2025-12-24, 2026-01-01"
                  />
                </div>
                {previewCount > 0 && (
                  <p className="text-xs text-primary">
                    → {previewCount} évènement{previewCount > 1 ? 's' : ''} seront créés
                  </p>
                )}
              </div>
            )}

            {/* Note */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">
                Note <span className="text-foreground/30">(optionnel)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  dirty();
                }}
                rows={2}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-background resize-y"
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
        )}
      </div>
    </div>
  );
}
