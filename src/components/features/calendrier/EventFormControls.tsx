export type SeriesScope = 'single' | 'following';

// Choix de la portée d'une modification sur un évènement faisant partie d'une série
export function SeriesScopeField({
  value,
  onChangeAction,
}: {
  value: SeriesScope;
  onChangeAction: (scope: SeriesScope) => void;
}) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-background-secondary border border-border">
      <p className="text-xs font-medium text-foreground/50">Portée des modifications</p>
      {(['single', 'following'] as const).map((scope) => (
        <label key={scope} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="seriesScope"
            value={scope}
            checked={value === scope}
            onChange={() => onChangeAction(scope)}
            className="accent-primary"
          />
          <span className="text-sm text-foreground">
            {scope === 'single' ? 'Cet évènement seulement' : 'Cet évènement et les suivants'}
          </span>
        </label>
      ))}
    </div>
  );
}

export function RecurringToggle({
  checked,
  onToggleAction,
}: {
  checked: boolean;
  onToggleAction: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Répétition récurrente"
        onClick={onToggleAction}
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-border'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
      <span className="text-sm text-foreground/70">Répétition récurrente</span>
    </div>
  );
}
