import type { TaskPriority, TaskStatus } from '@/types/tasks';

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  on_hold: 'En attente',
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
};

export const PRIORITY_KEYS = Object.keys(PRIORITY_LABELS) as TaskPriority[];
export const STATUS_KEYS = Object.keys(STATUS_LABELS) as TaskStatus[];
