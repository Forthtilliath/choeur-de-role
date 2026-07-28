import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const extendedTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'text-shadow': ['text-shadow-outline'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return extendedTwMerge(clsx(inputs));
}

export function fromLocalDatetimeInput(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function toLocalDatetimeInput(dateStr: string): string {
  const date = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getCurrentTimestampString(): string {
  const date = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}
