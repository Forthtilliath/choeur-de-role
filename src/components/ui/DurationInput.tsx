import type { DurationUnit } from '@/types/tasks';
import { Select } from './Select';

const UNITS: { value: DurationUnit; label: string }[] = [
  { value: 'minutes', label: 'min' },
  { value: 'hours', label: 'h' },
  { value: 'days', label: 'j' },
  { value: 'weeks', label: 'sem' },
];

export const DURATION_UNIT_LABELS: Record<DurationUnit, string> = {
  minutes: 'min',
  hours: 'h',
  days: 'j',
  weeks: 'sem',
};

type Props = {
  value: number | null;
  unit: DurationUnit | null;
  onChangeAction: (value: number | null, unit: DurationUnit | null) => void;
  className?: string;
};

export function DurationInput({ value, unit, onChangeAction, className }: Props) {
  const effectiveUnit = unit ?? 'hours';

  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (!raw) {
      onChangeAction(null, null);
      return;
    }
    const n = parseInt(raw, 10);
    if (isNaN(n) || n <= 0) return;
    onChangeAction(n, effectiveUnit);
  }

  function handleUnitChange(e: React.ChangeEvent<HTMLSelectElement>) {
    onChangeAction(value, e.target.value as DurationUnit);
  }

  return (
    <div className={`flex gap-1.5 items-center ${className ?? ''}`}>
      <input
        type="number"
        min={1}
        step={1}
        value={value ?? ''}
        onChange={handleValueChange}
        placeholder="—"
        className="w-16 border border-border rounded-lg px-2 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-primary transition-colors text-center"
      />
      <Select
        value={effectiveUnit}
        onChange={handleUnitChange}
        disabled={!value}
        className="text-sm py-2"
      >
        {UNITS.map((u) => (
          <option key={u.value} value={u.value}>
            {u.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
