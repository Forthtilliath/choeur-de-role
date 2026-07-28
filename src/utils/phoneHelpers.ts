export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const match = digits.match(/^(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);
  if (!match) return digits;
  return [match[1], match[2], match[3], match[4], match[5]].filter(Boolean).join(' ').trim();
}
