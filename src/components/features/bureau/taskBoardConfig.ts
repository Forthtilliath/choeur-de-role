import type { TaskPriority, TaskStatus } from '@/types/tasks';

export const STATUSES: TaskStatus[] = ['on_hold', 'todo', 'in_progress', 'done'];

export const COLUMNS: { id: TaskStatus; label: string; dotClass: string; emptyLabel: string }[] = [
  {
    id: 'on_hold',
    label: 'En attente',
    dotClass: 'bg-amber-400',
    emptyLabel: 'Aucune tâche en attente',
  },
  {
    id: 'todo',
    label: 'À faire',
    dotClass: 'bg-foreground/30',
    emptyLabel: 'Aucune tâche à faire',
  },
  {
    id: 'in_progress',
    label: 'En cours',
    dotClass: 'bg-blue-500',
    emptyLabel: 'Aucune tâche en cours',
  },
  { id: 'done', label: 'Terminé', dotClass: 'bg-green-500', emptyLabel: 'Aucune tâche terminée' },
];

export const PRIORITY_COLUMNS: {
  id: TaskPriority;
  label: string;
  dotClass: string;
  emptyLabel: string;
}[] = [
  { id: 'high', label: 'Haute', dotClass: 'bg-red-500', emptyLabel: 'Aucune tâche haute priorité' },
  {
    id: 'medium',
    label: 'Moyenne',
    dotClass: 'bg-amber-400',
    emptyLabel: 'Aucune tâche priorité moyenne',
  },
  {
    id: 'low',
    label: 'Basse',
    dotClass: 'bg-foreground/30',
    emptyLabel: 'Aucune tâche basse priorité',
  },
];

export const STATUS_DOT: Record<TaskStatus, string> = {
  on_hold: 'bg-amber-400',
  todo: 'bg-foreground/30',
  in_progress: 'bg-blue-500',
  done: 'bg-green-500',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  on_hold: 'En attente',
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
};
