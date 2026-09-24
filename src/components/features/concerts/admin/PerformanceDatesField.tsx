export type PerformanceDateInput = { key: string; date: string };

type Props = {
  dates: PerformanceDateInput[];
  onUpdateAction: (index: number, value: string) => void;
  onRemoveAction: (index: number) => void;
  onAddAction: () => void;
};

export function PerformanceDatesField({
  dates,
  onUpdateAction,
  onRemoveAction,
  onAddAction,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-foreground">Dates</span>
      {dates.map((date, index) => (
        <div key={date.key} className="flex gap-3 items-center">
          <input
            type="datetime-local"
            value={date.date}
            onChange={(e) => onUpdateAction(index, e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background flex-1"
          />
          {dates.length > 1 && (
            <button
              type="button"
              onClick={() => onRemoveAction(index)}
              className="text-red-400 hover:text-red-600 text-sm transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAddAction}
        className="text-sm text-primary hover:opacity-70 self-start transition-opacity"
      >
        + Ajouter une date
      </button>
    </div>
  );
}
