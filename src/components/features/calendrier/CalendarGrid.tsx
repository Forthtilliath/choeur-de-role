'use client';

import { formatTime } from '@/utils/dateHelpers';
import { CalendarEvent } from './types';

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

type Cell = { type: 'empty'; key: string } | { type: 'day'; day: number; key: string };

type Props = {
  year: number;
  month: number;
  events: CalendarEvent[];
  canEdit: boolean;
  onPrevMonthAction: () => void;
  onNextMonthAction: () => void;
  onClickEventAction: (event: CalendarEvent) => void;
  onClickAddDayAction: (day: Date) => void;
  birthdayCountsByMonth?: Record<number, number>;
};

export function CalendarGrid({
  year,
  month,
  events,
  canEdit,
  onPrevMonthAction,
  onNextMonthAction,
  onClickEventAction,
  onClickAddDayAction,
  birthdayCountsByMonth,
}: Props) {
  const today = new Date();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayRaw = new Date(year, month, 1).getDay();
  const firstDay = firstDayRaw === 0 ? 6 : firstDayRaw - 1;

  const nextEvent = events
    .filter((e) => new Date(e.starts_at) > today)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];

  function getEventsForDay(day: number) {
    return events
      .filter((e) => {
        const d = new Date(e.starts_at);
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
      })
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }

  function isToday(day: number) {
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  }

  function isNextEvent(day: number) {
    if (!nextEvent) return false;
    const d = new Date(nextEvent.starts_at);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  }

  const emptyCells: Cell[] = Array.from({ length: firstDay }, (_, i) => ({
    type: 'empty',
    key: `e${i}`,
  }));
  const dayCells: Cell[] = Array.from({ length: daysInMonth }, (_, i) => ({
    type: 'day',
    day: i + 1,
    key: `d${i + 1}`,
  }));
  const cells: Cell[] = [...emptyCells, ...dayCells];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevMonthAction}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
        >
          ←
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <h2 className="text-base font-medium text-foreground">
            {MONTHS[month]} {year}
          </h2>
          {birthdayCountsByMonth?.[month] ? (
            <span className="text-xs text-foreground/40">
              🎂 {birthdayCountsByMonth[month]} anniversaire{birthdayCountsByMonth[month] > 1 ? 's' : ''}
            </span>
          ) : null}
        </div>
        <button
          onClick={onNextMonthAction}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-xs text-foreground/40 text-center py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          if (cell.type === 'empty') return <div key={cell.key} />;
          const dayEvents = getEventsForDay(cell.day);
          const today_ = isToday(cell.day);
          const next_ = isNextEvent(cell.day);

          return (
            <div
              key={cell.key}
              className={`min-h-16 rounded-xl p-1.5 border transition-colors relative group
                ${
                  today_
                    ? 'bg-primary/10 border-primary'
                    : next_
                      ? 'border-primary border-2 border-dashed bg-background'
                      : 'border-border bg-background hover:bg-background-secondary'
                }`}
            >
              <div
                className={`text-xs font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full
                ${today_ ? 'bg-primary text-white' : 'text-foreground/60'}`}
              >
                {cell.day}
              </div>

              <div className="flex flex-col gap-0.5">
                {dayEvents.map((event) => {
                  const start = new Date(event.starts_at);
                  const end = new Date(event.ends_at);
                  const timeStr = `${formatTime(start)}–${formatTime(end)}`;
                  return (
                    <div key={event.id} className="relative group/ev">
                      <button
                        onClick={() => onClickEventAction(event)}
                        className="w-full text-left rounded border-l-2 pl-1.5 pr-1 py-0.5 text-xs leading-tight hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `${event.event_types.color}18`,
                          borderLeftColor: event.event_types.color,
                        }}
                      >
                        <span className="font-medium truncate block text-foreground">{event.title}</span>
                        {!event.id.startsWith('birthday-') && (
                          <span className="text-foreground/50">{timeStr}</span>
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
                  onClick={() => onClickAddDayAction(new Date(year, month, cell.day))}
                  className="absolute top-1 right-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity w-6 h-6 md:w-4 md:h-4 rounded flex items-center justify-center bg-primary/20 text-primary text-xs hover:bg-primary/40"
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
