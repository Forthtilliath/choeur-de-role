'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useConfirm } from '@/context/ConfirmContext';
import { useNow } from '@/hooks/useNow';

import { CalendarGrid } from './CalendarGrid';
import { CalendarSidebar } from './CalendarSidebar';
import type { CalendarView } from './CalendarToolbar';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarWeek } from './CalendarWeek';
import { deleteCalendarEvent } from './clientQueries';
import { EventForm } from './EventForm';
import type { CalendarEvent, EventType } from './types';

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

export function CalendrierClient({
  initialEvents,
  eventTypes,
  canEdit,
  initialEventId,
  birthdayCountsByMonth,
}: Props) {
  const today = new Date(useNow());
  const initialEvent = initialEventId
    ? (initialEvents.find((e) => e.id === initialEventId) ?? null)
    : null;
  const initialDate = initialEvent ? new Date(initialEvent.starts_at) : today;

  const [view, setView] = useState<CalendarView>('month');
  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [weekStart, setWeekStart] = useState(() => getMondayOf(initialDate));
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const confirm = useConfirm();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(initialEvent);
  const [showForm, setShowForm] = useState(!!initialEvent);
  const [isDirty, setIsDirty] = useState(false);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
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

  function switchView(v: CalendarView) {
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
            ? {
                ...e,
                title: event.title,
                event_type_id: event.event_type_id,
                event_types: event.event_types,
                location: event.location,
                description: event.description,
              }
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
    if (
      !(await confirm({
        message: 'Supprimer cet évènement ?',
        danger: true,
        details: item ? { icon: '📅', label: item.title } : undefined,
      }))
    )
      return;
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
      if (
        await confirm({
          message: 'Des modifications non sauvegardées seront perdues. Fermer quand même ?',
        })
      )
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
      <CalendarToolbar eventTypes={eventTypes} view={view} onViewChangeAction={switchView} />

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
              onClickEventAction={(event) => {
                setEditingEvent(event);
                setShowForm(true);
              }}
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
                onClickEventAction={(event) => {
                  setEditingEvent(event);
                  setShowForm(true);
                }}
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
                onClickEventAction={(event) => {
                  setEditingEvent(event);
                  setShowForm(true);
                }}
                onClickAddDayAction={openAddDay}
              />
            )}
          </div>
        </div>

        <CalendarSidebar events={events} />
      </div>

      {showForm && (
        // Backdrop click-to-dismiss — Escape (géré dans EventForm) est l'équivalent clavier.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
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
