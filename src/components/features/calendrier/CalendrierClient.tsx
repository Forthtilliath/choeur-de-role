'use client';

import { useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { CalendarGrid } from './CalendarGrid';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarWeek } from './CalendarWeek';
import { EventForm } from './EventForm';
import { deleteCalendarEvent } from './clientQueries';
import { CalendarEvent, EventType } from './types';

type Props = {
  initialEvents: CalendarEvent[];
  eventTypes: EventType[];
  canEdit: boolean;
  initialEventId?: string;
  birthdayCountsByMonth?: Record<number, number>;
};

function getMondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

export function CalendrierClient({ initialEvents, eventTypes, canEdit, initialEventId, birthdayCountsByMonth }: Props) {
  const today = new Date();
  const initialEvent = initialEventId
    ? (initialEvents.find((e) => e.id === initialEventId) ?? null)
    : null;
  const initialDate = initialEvent ? new Date(initialEvent.starts_at) : today;

  const [view, setView] = useState<'month' | 'week'>('month');
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [weekStart, setWeekStart] = useState(() => getMondayOf(initialDate));
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const confirm = useConfirm();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(initialEvent);
  const [showForm, setShowForm] = useState(!!initialEvent);
  const [isDirty, setIsDirty] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function prevWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function nextWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function switchView(v: 'month' | 'week') {
    setView(v);
    // Sync week start to the currently displayed month when switching to week
    if (v === 'week') setWeekStart(getMondayOf(new Date(year, month, 1)));
  }

  function handleSave(event: CalendarEvent, seriesUpdated?: boolean) {
    setEvents((prev) => {
      let next = prev.map((e) => (e.id === event.id ? event : e));
      if (!prev.find((e) => e.id === event.id)) next = [...prev, event];
      if (seriesUpdated && event.series_id) {
        next = next.map((e) =>
          e.series_id === event.series_id && e.starts_at >= event.starts_at && e.id !== event.id
            ? { ...e, title: event.title, event_type_id: event.event_type_id, event_types: event.event_types, location: event.location, description: event.description }
            : e,
        );
      }
      return next;
    });
    closeForm();
  }

  async function handleDelete(id: string) {
    if (id.startsWith('birthday-')) return;
    const item = events.find((e) => e.id === id);
    if (!await confirm({
      message: 'Supprimer cet évènement ?',
      danger: true,
      details: item ? { icon: '📅', label: item.title } : undefined,
    })) return;
    const ok = await deleteCalendarEvent(id);
    if (ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
      closeForm();
      toast.success('Évènement supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditingEvent(null);
    setIsDirty(false);
  }

  async function handleBackdropClick() {
    if (isDirty) {
      if (await confirm({ message: 'Des modifications non sauvegardées seront perdues. Fermer quand même ?' }))
        closeForm();
    } else {
      closeForm();
    }
  }

  function openAddDay(day: Date) {
    setSelectedDay(day);
    setEditingEvent(null);
    setShowForm(true);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Légende + toggle vue */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          {/* Mobile : bouton toggle légende */}
          <button
            className="md:hidden flex items-center gap-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
            onClick={() => setLegendOpen((v) => !v)}
          >
            <span className="flex gap-1">
              {eventTypes.slice(0, 4).map((et) => (
                <span key={et.id} className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: et.color }} />
              ))}
            </span>
            Légende {legendOpen ? '▲' : '▼'}
          </button>

          {/* Desktop : légende complète inline */}
          <div className="hidden md:flex flex-wrap gap-3 flex-1">
            {eventTypes.map((et) => (
              <div key={et.id} className="flex items-center gap-1.5 text-xs text-foreground/60">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: et.color }} />
                {et.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-xs text-foreground/60">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              Aujourd&apos;hui
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground/60">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-primary shrink-0" />
              Prochain rassemblement
            </div>
          </div>

          {/* Contrôles droite : toggle vue + export */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle mois/semaine — desktop uniquement */}
            <div className="hidden md:flex gap-1 border border-border rounded-lg p-0.5">
              {(['month', 'week'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => switchView(v)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    view === v
                      ? 'bg-primary text-white'
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {v === 'month' ? 'Mois' : 'Semaine'}
                </button>
              ))}
            </div>

            {/* Export iCal */}
            <a
              href="/api/calendrier/export-ical"
              download="calendrier-cda.ics"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border text-foreground/50 hover:text-foreground hover:border-primary/40 transition-colors"
              title="Exporter le calendrier (.ics)"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span className="hidden sm:inline">.ics</span>
            </a>
          </div>
        </div>

        {/* Légende dépliée — mobile uniquement */}
        {legendOpen && (
          <div className="md:hidden flex flex-col gap-2 p-3 rounded-xl border border-border bg-background-secondary">
            {eventTypes.map((et) => (
              <div key={et.id} className="flex items-center gap-2 text-xs text-foreground/60">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: et.color }} />
                {et.label}
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
              Aujourd&apos;hui
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-primary shrink-0" />
              Prochain rassemblement
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_260px] gap-8">
        <div>
          {/* Mobile : toujours vue semaine */}
          <div className="md:hidden">
            <CalendarWeek
              weekStart={weekStart}
              events={events}
              canEdit={canEdit}
              onPrevWeekAction={prevWeek}
              onNextWeekAction={nextWeek}
              onClickEventAction={(event) => { setEditingEvent(event); setShowForm(true); }}
              onClickAddDayAction={openAddDay}
            />
          </div>

          {/* Desktop : vue active */}
          <div className="hidden md:block">
            {view === 'month' ? (
              <CalendarGrid
                year={year}
                month={month}
                events={events}
                canEdit={canEdit}
                onPrevMonthAction={prevMonth}
                onNextMonthAction={nextMonth}
                onClickEventAction={(event) => { setEditingEvent(event); setShowForm(true); }}
                onClickAddDayAction={openAddDay}
                birthdayCountsByMonth={birthdayCountsByMonth}
              />
            ) : (
              <CalendarWeek
                weekStart={weekStart}
                events={events}
                canEdit={canEdit}
                onPrevWeekAction={prevWeek}
                onNextWeekAction={nextWeek}
                onClickEventAction={(event) => { setEditingEvent(event); setShowForm(true); }}
                onClickAddDayAction={openAddDay}
              />
            )}
          </div>
        </div>

        <CalendarSidebar events={events} />
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Formulaire d'évènement"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <EventForm
              event={editingEvent}
              eventTypes={eventTypes}
              defaultDay={selectedDay ?? undefined}
              onCloseAction={closeForm}
              onSaveAction={handleSave}
              onDeleteAction={canEdit ? handleDelete : undefined}
              canEdit={canEdit}
              onDirtyChangeAction={setIsDirty}
            />
          </div>
        </div>
      )}
    </div>
  );
}
