export type RecurrenceSettings = {
  day: number; // jour ISO : 1 = lundi … 7 = dimanche
  startTime: string;
  endTime: string;
  from: string;
  to: string;
  exclusions: string; // dates AAAA-MM-JJ séparées par des virgules
};

export const DEFAULT_RECURRENCE: RecurrenceSettings = {
  day: 1,
  startTime: '20:00',
  endTime: '22:00',
  from: '',
  to: '',
  exclusions: '',
};

export const WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const pad = (n: number) => String(n).padStart(2, '0');

export const toDatetimeLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Toutes les occurrences hebdomadaires du jour choisi entre from et to, hors exclusions
export function generateRecurringDates(r: RecurrenceSettings): Date[] {
  if (!r.from || !r.to) return [];
  const from = new Date(r.from);
  const to = new Date(r.to);
  const exclusions = r.exclusions
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const dates: Date[] = [];
  const current = new Date(from);

  while (true) {
    const jsDay = current.getDay();
    const isoDay = jsDay === 0 ? 7 : jsDay;
    if (isoDay === r.day) break;
    current.setDate(current.getDate() + 1);
  }

  while (current <= to) {
    const dateStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}`;
    if (!exclusions.includes(dateStr)) dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return dates;
}

type EventBase = {
  title: string;
  event_type_id: string;
  location: string | null;
  description: string | null;
};

// Lignes à insérer pour une série : même heures chaque occurrence, un series_id commun
export function buildRecurringRows(dates: Date[], r: RecurrenceSettings, base: EventBase) {
  const [startH = 0, startM = 0] = r.startTime.split(':').map(Number);
  const [endH = 0, endM = 0] = r.endTime.split(':').map(Number);
  const seriesId = crypto.randomUUID();

  return dates.map((d) => {
    const starts = new Date(d);
    starts.setHours(startH, startM, 0, 0);
    const ends = new Date(d);
    ends.setHours(endH, endM, 0, 0);
    return {
      ...base,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      series_id: seriesId,
    };
  });
}
