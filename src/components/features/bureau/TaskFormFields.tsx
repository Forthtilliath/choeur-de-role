'use client';

import { DurationInput } from '@/components/ui/DurationInput';
import { Select } from '@/components/ui/Select';
import type { CaMember, DurationUnit, TaskCategory, TaskPriority } from '@/types/tasks';

export type TaskFormValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  durationValue: number | null;
  durationUnit: DurationUnit | null;
  categoryId: string | null;
  assigneeIds: string[];
};

const PRIORITIES: {
  id: TaskPriority;
  label: string;
  className: string;
  activeClassName: string;
}[] = [
  {
    id: 'low',
    label: 'Basse',
    className: 'border-border text-foreground/50 hover:border-foreground/30',
    activeClassName: 'border-foreground/40 bg-foreground/8 text-foreground',
  },
  {
    id: 'medium',
    label: 'Moyenne',
    className:
      'border-amber-200 text-amber-600 hover:border-amber-400 dark:border-amber-800 dark:text-amber-400',
    activeClassName:
      'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  },
  {
    id: 'high',
    label: 'Haute',
    className:
      'border-red-200 text-red-500 hover:border-red-400 dark:border-red-800 dark:text-red-400',
    activeClassName: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  },
];

const LABEL_CLASS = 'text-xs font-medium text-foreground/60 uppercase tracking-wide';
const INPUT_CLASS =
  'border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors';

function initials(firstName: string | null, lastName: string | null) {
  return `${(firstName?.[0] ?? '').toUpperCase()}${(lastName?.[0] ?? '').toUpperCase()}`;
}

type Props = {
  values: TaskFormValues;
  onChangeAction: (patch: Partial<TaskFormValues>) => void;
  categories: TaskCategory[];
  caMembers: CaMember[];
  titleRef: React.RefObject<HTMLInputElement | null>;
};

export function TaskFormFields({ values, onChangeAction, categories, caMembers, titleRef }: Props) {
  function toggleAssignee(memberId: string) {
    const ids = values.assigneeIds;
    onChangeAction({
      assigneeIds: ids.includes(memberId)
        ? ids.filter((id) => id !== memberId)
        : [...ids, memberId],
    });
  }

  return (
    <>
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-title" className={LABEL_CLASS}>
          Titre
        </label>
        <input
          id="task-title"
          ref={titleRef}
          value={values.title}
          onChange={(e) => onChangeAction({ title: e.target.value })}
          placeholder="Titre de la tâche"
          className={INPUT_CLASS}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="task-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="task-description"
          value={values.description}
          onChange={(e) => onChangeAction({ description: e.target.value })}
          placeholder="Détails, contexte, liens utiles..."
          rows={3}
          className={`${INPUT_CLASS} resize-none`}
        />
      </div>

      {/* Priority + Due date */}
      <div className="grid grid-cols-2 gap-4">
        <fieldset className="flex flex-col gap-1.5">
          <legend className={LABEL_CLASS}>Priorité</legend>
          <div className="flex gap-1.5">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onChangeAction({ priority: p.id })}
                className={`flex-1 py-1.5 text-xs font-medium border rounded-lg transition-all ${
                  values.priority === p.id ? p.activeClassName : p.className
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-due-date" className={LABEL_CLASS}>
            Échéance
          </label>
          <input
            id="task-due-date"
            type="date"
            value={values.dueDate}
            onChange={(e) => onChangeAction({ dueDate: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {/* Duration + Category */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={LABEL_CLASS}>Durée estimée</span>
          <DurationInput
            value={values.durationValue}
            unit={values.durationUnit}
            onChangeAction={(v, u) => onChangeAction({ durationValue: v, durationUnit: u })}
          />
        </div>
        {categories.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-category" className={LABEL_CLASS}>
              Catégorie
            </label>
            <Select
              id="task-category"
              value={values.categoryId ?? ''}
              onChange={(e) => onChangeAction({ categoryId: e.target.value || null })}
              wrapperClassName="w-full"
            >
              <option value="">— Aucune —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {/* Assignees */}
      <fieldset className="flex flex-col gap-2">
        <legend className={LABEL_CLASS}>Assignés</legend>
        <div className="flex flex-wrap gap-1.5">
          {caMembers.map((member) => {
            const isSelected = values.assigneeIds.includes(member.id);
            const name = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim();
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleAssignee(member.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-primary/10 border-primary/40 text-primary'
                    : 'border-border text-foreground/60 hover:border-primary/30 hover:text-foreground'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${isSelected ? 'bg-primary text-white' : 'bg-foreground/10 text-foreground/60'}`}
                >
                  {initials(member.first_name, member.last_name)}
                </span>
                {name || 'Inconnu'}
              </button>
            );
          })}
        </div>
      </fieldset>
    </>
  );
}
