import { CalendarEvent } from '@/components/features/calendrier/types';

const CRLF = '\r\n';

function foldLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const segments: string[] = [];
  let remaining = line;
  let first = true;

  while (remaining.length > 0) {
    const limit = first ? 75 : 74; // continuation lines lose 1 byte to the leading space
    first = false;

    let chars = 0;
    let byteCount = 0;
    for (const char of remaining) {
      const charBytes = encoder.encode(char).length;
      if (byteCount + charBytes > limit) break;
      byteCount += charBytes;
      chars += char.length; // .length handles surrogate pairs correctly
    }

    segments.push(remaining.slice(0, chars));
    remaining = remaining.slice(chars);
  }

  return segments[0] + (segments.length > 1 ? CRLF + segments.slice(1).map((s) => ' ' + s).join(CRLF) : '');
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function toIcalDate(iso: string): string {
  // Remove separators, strip milliseconds, normalise timezone to Z
  return iso
    .replace(/[-:]/g, '')
    .replace(/\.\d+/, '')
    .replace(' ', 'T')
    .replace(/[+-]\d{4}$/, 'Z'); // +0000 / -0000 → Z
}

function prop(name: string, value: string): string {
  return foldLine(`${name}:${value}`);
}

export function generateIcal(
  events: CalendarEvent[],
  calName: string,
  prodId: string,
  domain: string,
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${prodId}//FR`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    prop('X-WR-CALNAME', escapeText(calName)),
    'X-WR-TIMEZONE:Europe/Paris',
    prop('X-WR-CALDESC', 'Répétitions\\, concerts et évènements'),
  ];

  for (const event of events) {
    const descriptionRaw = event.description ? stripHtml(event.description) : '';
    const categoryLabel = event.event_types.label;
    const description = [categoryLabel, descriptionRaw].filter(Boolean).join('\n');

    lines.push('BEGIN:VEVENT');
    lines.push(prop('UID', `${event.id}@${domain}`));
    lines.push(prop('DTSTART', toIcalDate(event.starts_at)));
    lines.push(prop('DTEND', toIcalDate(event.ends_at)));
    lines.push(prop('SUMMARY', escapeText(event.title)));
    if (description) lines.push(prop('DESCRIPTION', escapeText(description)));
    if (event.location) lines.push(prop('LOCATION', escapeText(event.location)));
    lines.push(prop('CATEGORIES', escapeText(categoryLabel)));
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  // UTF-8 BOM (﻿) — tells Windows apps (Outlook, Excel…) that the file is UTF-8
  return '﻿' + lines.join(CRLF) + CRLF;
}
