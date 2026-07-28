import { formatDayMonthShort, formatTime } from '@/utils/dateHelpers';
import { LocationMap } from './LocationMap';
import { CalendarEvent } from './types';

export function CalendarSidebar({ events }: { events: CalendarEvent[] }) {
  const today = new Date();
  const upcoming = events
    .filter((e) => new Date(e.starts_at) > today)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-medium text-foreground">5 prochains évènements</h3>
        <p className="text-xs text-foreground/40">à partir d&apos;aujourd&apos;hui, indépendant de la navigation</p>
      </div>
      {upcoming.length === 0 && (
        <p className="text-xs text-foreground/40">Aucun évènement à venir.</p>
      )}
      {upcoming.map((event) => {
        const d = new Date(event.starts_at);
        const isBirthday = event.id.startsWith('birthday-');
        const dateStr = formatDayMonthShort(event.starts_at);
        const timeStr = formatTime(d);
        return (
          <div key={event.id} className="flex gap-3 items-start">
            <div
              className="w-1 rounded-full self-stretch shrink-0 mt-0.5"
              style={{ backgroundColor: event.event_types.color }}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{event.title}</p>
              <p className="text-xs text-foreground/50">
                {dateStr}{isBirthday ? ' · Toute la journée' : ` · ${timeStr}`}
              </p>
              {event.location && <LocationMap location={event.location} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
