import type { RecurrenceSettings } from './recurrence';
import { WEEKDAYS } from './recurrence';

const INPUT_CLASS = 'border border-border rounded-lg px-3 py-2 text-sm bg-background';

type Props = {
  value: RecurrenceSettings;
  onChangeAction: (patch: Partial<RecurrenceSettings>) => void;
  previewCount: number;
};

export function RecurrenceFields({ value, onChangeAction, previewCount }: Props) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-background-secondary border border-border">
      <fieldset className="flex flex-col gap-1">
        <legend className="text-xs text-foreground/50">Jour de la semaine</legend>
        <div className="flex flex-wrap gap-1">
          {WEEKDAYS.map((day, idx) => (
            <button
              key={day}
              type="button"
              onClick={() => onChangeAction({ day: idx + 1 })}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${value.day === idx + 1 ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'}`}
            >
              {day}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="calendar-event-recur-start-time" className="text-xs text-foreground/50">
            Heure de début
          </label>
          <input
            id="calendar-event-recur-start-time"
            type="time"
            value={value.startTime}
            onChange={(e) => onChangeAction({ startTime: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="calendar-event-recur-end-time" className="text-xs text-foreground/50">
            Heure de fin
          </label>
          <input
            id="calendar-event-recur-end-time"
            type="time"
            value={value.endTime}
            onChange={(e) => onChangeAction({ endTime: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="calendar-event-recur-from" className="text-xs text-foreground/50">
            Du
          </label>
          <input
            id="calendar-event-recur-from"
            type="date"
            value={value.from}
            onChange={(e) => onChangeAction({ from: e.target.value })}
            required
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="calendar-event-recur-to" className="text-xs text-foreground/50">
            Au
          </label>
          <input
            id="calendar-event-recur-to"
            type="date"
            value={value.to}
            onChange={(e) => onChangeAction({ to: e.target.value })}
            required
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="calendar-event-recur-exclusions" className="text-xs text-foreground/50">
          Dates à exclure{' '}
          <span className="text-foreground/30">(AAAA-MM-JJ, séparées par virgules)</span>
        </label>
        <input
          id="calendar-event-recur-exclusions"
          value={value.exclusions}
          onChange={(e) => onChangeAction({ exclusions: e.target.value })}
          className={INPUT_CLASS}
          placeholder="2025-12-24, 2026-01-01"
        />
      </div>
      {previewCount > 0 && (
        <p className="text-xs text-primary">
          → {previewCount} évènement{previewCount > 1 ? 's' : ''} seront créés
        </p>
      )}
    </div>
  );
}
