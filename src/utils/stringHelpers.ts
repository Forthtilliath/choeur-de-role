export function toUpperCase(s: string | null | undefined): string {
  return s?.toUpperCase() ?? '';
}

/** Capitalise chaque mot (après espace, tiret ou apostrophe). */
export function toTitleCase(s: string | null | undefined): string {
  if (!s) return '';
  return s.toLowerCase().replace(/(^|[\s\-'])(\S)/g, (_, sep, char) => sep + char.toUpperCase());
}

/** Échappe les caractères HTML dangereux pour insertion sûre dans innerHTML. */
export function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
