import { randomId } from '@forthtilliath/ts-kit';

import type { ExternalEventDate } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtTime = (d: Date) =>
  d.getHours() === 0 && d.getMinutes() === 0 ? '' : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export type DateEntry = {
  key: string; // identifiant client stable (clé React) — non enregistré
  startDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM" or ""
  endTime: string; // "HH:MM" or "" — heure de fin le même jour
  endDate: string; // "YYYY-MM-DD" or "" — jour de fin différent
};

export function dateEntryFromRecord(d: ExternalEventDate): DateEntry {
  const start = new Date(d.date);
  const end = d.end_date ? new Date(d.end_date) : null;
  const sameDayEnd = end && isSameDay(start, end);
  return {
    key: d.id,
    startDate: fmtDate(start),
    startTime: fmtTime(start),
    endTime: sameDayEnd ? fmtTime(end!) : '',
    endDate: end && !sameDayEnd ? fmtDate(end) : '',
  };
}

export function dateEntryToPayload(e: DateEntry): { date: string; end_date: string | null } {
  const date = new Date(`${e.startDate}T${e.startTime || '00:00'}`).toISOString();
  let end_date: string | null = null;
  if (e.endDate) {
    end_date = new Date(`${e.endDate}T${e.endTime || '00:00'}`).toISOString();
  } else if (e.endTime) {
    end_date = new Date(`${e.startDate}T${e.endTime}`).toISOString();
  }
  return { date, end_date };
}

export const emptyEntry = (): DateEntry => ({
  key: randomId(),
  startDate: '',
  startTime: '',
  endTime: '',
  endDate: '',
});
