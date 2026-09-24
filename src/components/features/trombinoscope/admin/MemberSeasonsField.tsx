import type { Season } from '@/components/features/concerts';

type Props = {
  seasons: Season[];
  memberSeasons: string[];
  onToggleSeasonAction: (seasonId: string) => void;
};

// Saisons actives (ordre de création) ; chaque clic est enregistré immédiatement
export function MemberSeasonsField({ seasons, memberSeasons, onToggleSeasonAction }: Props) {
  const activeSeasons = seasons
    .filter((s) => s.active)
    .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());
  if (activeSeasons.length === 0) return null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-medium text-foreground/50">Saisons</legend>
      <div className="flex flex-wrap gap-2">
        {activeSeasons.map((s) => {
          const assigned = memberSeasons.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggleSeasonAction(s.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                assigned
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground/60'
              }`}
            >
              {assigned ? '✓ ' : ''}
              {s.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-foreground/30">
        Modifié immédiatement — pas besoin d&apos;enregistrer.
      </p>
    </fieldset>
  );
}
