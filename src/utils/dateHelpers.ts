const fmtDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const fmtDateShort = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const fmtDayMonth = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
});

const fmtDayMonthShort = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
});

const fmtLongDateTime = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const fmtDateTimeShort = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const fmtDateTimeCompact = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** "1 janvier 2025" */
export const formatDate = (dateStr: string) => fmtDate.format(new Date(dateStr));

/** "1 janv. 2025" */
export const formatDateShort = (dateStr: string) => fmtDateShort.format(new Date(dateStr));

/** "1 janvier" — sans année (ex. anniversaire) */
export const formatDayMonth = (dateStr: string) => fmtDayMonth.format(new Date(dateStr));

/** "1 janv." — sans année, mois court */
export const formatDayMonthShort = (dateStr: string) =>
  fmtDayMonthShort.format(new Date(dateStr));

/** "lundi 1 janvier 2025 à 20:00" */
export const formatLongDateTime = (dateStr: string) =>
  fmtLongDateTime.format(new Date(dateStr));

/** "1 janv. 2025 à 20:00" */
export const formatDateTimeShort = (dateStr: string) =>
  fmtDateTimeShort.format(new Date(dateStr));

/** "1 janv. à 20:00" — sans année */
export const formatDateTimeCompact = (dateStr: string) =>
  fmtDateTimeCompact.format(new Date(dateStr));

/** "20h" ou "20h30" */
export const formatTime = (date: Date) => {
  const m = date.getMinutes();
  return m === 0 ? `${date.getHours()}h` : `${date.getHours()}h${String(m).padStart(2, '0')}`;
};

const isMidnight = (d: Date) => d.getHours() === 0 && d.getMinutes() === 0;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Formate une occurrence d'événement selon le cas :
 * - date seule          → "lundi 15 mars 2025"
 * - date + heure        → "lundi 15 mars 2025 · 20h00"
 * - créneau horaire     → "lundi 15 mars 2025 · 10h00 → 18h00"
 * - multi-jours         → "15 mars → 17 mars 2025"
 */
export function formatEventDateRange(dateStr: string, endDateStr?: string | null): string {
  const start = new Date(dateStr);
  const end = endDateStr ? new Date(endDateStr) : null;

  const hasStartTime = !isMidnight(start);
  const hasEndTime = end && !isMidnight(end);
  const sameDayEnd = end && isSameDay(start, end);

  if (!end) {
    if (hasStartTime) return `${fmtLongDateTime.format(start)}`;
    return fmtDate.format(start);
  }

  if (sameDayEnd) {
    const base = fmtDate.format(start);
    if (hasStartTime && hasEndTime)
      return `${base} · ${formatTime(start)} à ${formatTime(end)}`;
    if (hasStartTime) return `${base} · à partir de ${formatTime(start)}`;
    return base;
  }

  // Multi-jours
  const startStr = fmtDayMonth.format(start);
  const endStr = fmtDate.format(end);
  return `${startStr} → ${endStr}`;
}
