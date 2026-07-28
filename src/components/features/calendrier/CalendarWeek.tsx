'use client';

import { formatTime } from '@/utils/dateHelpers';
import { CalendarEvent } from './types';

const MONTHS_SHORT = [
  'jan', 'fév', 'mar', 'avr', 'mai', 'juin',
  'juil', 'août', 'sep', 'oct', 'nov', 'déc',
];
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

type Props = {
  weekStart: Date;
  events: CalendarEvent[];
  canEdit: boolean;
  onPrevWeekAction: () => void;
  onNextWeekAction: () => void;
  onClickEventAction: (event: CalendarEvent) => void;
  onClickAddDayAction: (day: Date) => void;
};

export function CalendarWeek({
  weekStart,
  events,
  canEdit,
  onPrevWeekAction,
  onNextWeekAction,
  onClickEventAction,
  onClickAddDayAction,
}: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const weekEnd = days[6];
  const weekLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getDate()} – ${weekEnd.getDate()} ${MONTHS_SHORT[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
      : `${weekStart.getDate()} ${MONTHS_SHORT[weekStart.getMonth()]} – ${weekEnd.getDate()} ${MONTHS_SHORT[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;

  function getEventsForDay(date: Date) {
    return events
      .filter((e) => {
        const d = new Date(e.starts_at);
        return (
          d.getFullYear() === date.getFullYear() &&
          d.getMonth() === date.getMonth() &&
          d.getDate() === date.getDate()
        );
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }

  function isToday(date: Date) {
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-3 md:justify-between md:gap-0 mb-4">
        <button
          onClick={onPrevWeekAction}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
        >
          ←
        </button>
        <span className="text-sm md:text-base font-medium text-foreground">{weekLabel}</span>
        <button
          onClick={onNextWeekAction}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
        >
          →
        </button>
      </div>

      {/* Desktop : 4+3 colonnes sur 2 lignes */}
      <div className="hidden md:grid grid-cols-4 gap-2">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const today_ = isToday(day);
          return (
            <div
              key={i}
              className={`rounded-xl border p-2 min-h-28 flex flex-col gap-1 ${
                today_ ? 'bg-primary/10 border-primary' : 'border-border bg-background'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground/40">{DAYS[i]}</span>
                <span
                  className={`text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full ${
                    today_ ? 'bg-primary text-white' : 'text-foreground/70'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                {dayEvents.map((event) => {
                  const start = new Date(event.starts_at);
                  const end = new Date(event.ends_at);
                  return (
                    <div key={event.id} className="relative group/ev">
                      <button
                        onClick={() => onClickEventAction(event)}
                        className="w-full text-left rounded border-l-2 pl-1.5 pr-1 py-1 text-xs hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `${event.event_types.color}18`,
                          borderLeftColor: event.event_types.color,
                        }}
                      >
                        <span className="font-medium block truncate text-foreground">{event.title}</span>
                        {!event.id.startsWith('birthday-') && (
                          <span className="text-foreground/50">{formatTime(start)}–{formatTime(end)}</span>
                        )}
                      </button>
                      {event.description && (
                        <div className="pointer-events-none absolute z-50 bottom-full left-0 mb-1 hidden group-hover/ev:block w-52 rounded-lg border border-border bg-background p-2 text-xs text-foreground/70 shadow-lg whitespace-pre-line">
                          {event.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {canEdit && (
                <button
                  onClick={() => onClickAddDayAction(day)}
                  className="w-full text-xs text-foreground/30 hover:text-primary hover:bg-primary/10 rounded py-0.5 transition-colors mt-auto"
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile : liste verticale */}
      <div className="md:hidden flex flex-col gap-2">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const today_ = isToday(day);
          return (
            <div
              key={i}
              className={`rounded-xl border p-3 ${
                today_
                  ? 'bg-primary/10 border-primary'
                  : dayEvents.length > 0
                    ? 'border-border bg-background'
                    : 'border-border/40 bg-background/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      today_ ? 'bg-primary text-white' : 'text-foreground/70'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  <span className="text-sm text-foreground/60">{DAYS[i]}</span>
                </div>
                {canEdit && (
                  <button
                    onClick={() => onClickAddDayAction(day)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    +
                  </button>
                )}
              </div>
              {dayEvents.length === 0 ? (
                <p className="text-xs text-foreground/30 pl-9">Aucun évènement</p>
              ) : (
                <div className="flex flex-col gap-1.5 pl-9">
                  {dayEvents.map((event) => {
                    const start = new Date(event.starts_at);
                    const end = new Date(event.ends_at);
                    return (
                      <div key={event.id} className="relative group/ev">
                        <button
                          onClick={() => onClickEventAction(event)}
                          className="w-full text-left rounded-lg border-l-2 pl-3 pr-2 py-2 hover:opacity-80 transition-opacity"
                          style={{
                            backgroundColor: `${event.event_types.color}18`,
                            borderLeftColor: event.event_types.color,
                          }}
                        >
                          <span className="text-sm font-medium block text-foreground">{event.title}</span>
                          {!event.id.startsWith('birthday-') && (
                            <span className="text-xs text-foreground/50">
                              {formatTime(start)}–{formatTime(end)}
                            </span>
                          )}
                        </button>
                        {event.description && (
                          <div className="pointer-events-none absolute z-50 bottom-full left-0 mb-1 hidden group-hover/ev:block w-52 rounded-lg border border-border bg-background p-2 text-xs text-foreground/70 shadow-lg whitespace-pre-line">
                            {event.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation basse — mobile uniquement */}
      <div className="md:hidden flex items-center justify-center gap-3 mt-4">
        <button
          onClick={onPrevWeekAction}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
        >
          ←
        </button>
        <span className="text-sm font-medium text-foreground">{weekLabel}</span>
        <button
          onClick={onNextWeekAction}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
        >
          →
        </button>
      </div>
    </div>
  );
}
