'use client';

import type { DateEntry } from './eventDates';
import { emptyEntry } from './eventDates';

type Props = {
  dates: DateEntry[];
  onChangeAction: (update: (prev: DateEntry[]) => DateEntry[]) => void;
};

// Occurrences d'un évènement : jour + heures, et jour de fin optionnel pour un stage multi-jours
export function EventDatesField({ dates, onChangeAction }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Dates</span>
      <div className="flex flex-col gap-3">
        {dates.map((entry, idx) => {
          const update = (patch: Partial<DateEntry>) =>
            onChangeAction((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)));
          return (
            <div
              key={entry.key}
              className="flex flex-col gap-1.5 p-3 border border-border rounded-xl bg-background"
            >
              {/* Ligne 1 : date début + heures */}
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="date"
                  value={entry.startDate}
                  onChange={(e) => update({ startDate: e.target.value })}
                  required={idx === 0}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
                />
                <span className="text-xs text-foreground/40">de</span>
                <input
                  type="time"
                  value={entry.startTime}
                  onChange={(e) => update({ startTime: e.target.value })}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background w-28"
                  placeholder="--:--"
                />
                <span className="text-xs text-foreground/40">à</span>
                <input
                  type="time"
                  value={entry.endTime}
                  onChange={(e) => update({ endTime: e.target.value })}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background w-28"
                  placeholder="--:--"
                />
                {dates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onChangeAction((prev) => prev.filter((_, i) => i !== idx))}
                    className="ml-auto text-foreground/30 hover:text-red-500 transition-colors text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Ligne 2 : date de fin (stage multi-jours) */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground/40">jusqu&apos;au</span>
                <input
                  type="date"
                  value={entry.endDate}
                  onChange={(e) => update({ endDate: e.target.value })}
                  min={entry.startDate || undefined}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
                />
                {entry.endDate && (
                  <button
                    type="button"
                    onClick={() => update({ endDate: '', endTime: '' })}
                    className="text-foreground/30 hover:text-red-500 transition-colors text-xs"
                  >
                    ✕
                  </button>
                )}
                {!entry.endDate && (
                  <span className="text-xs text-foreground/30 italic">
                    laisser vide si même journée
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChangeAction((prev) => [...prev, emptyEntry()])}
        className="self-start text-xs text-primary hover:opacity-70 transition-opacity"
      >
        + Ajouter une occurrence
      </button>
    </div>
  );
}
