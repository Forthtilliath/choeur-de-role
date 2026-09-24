'use client';

import { Button } from '@/components/ui/Button';

import type { PerformanceWithDates, SeasonWithPerformancesWithDates } from '../types';

import { PerformanceForm } from './PerformanceForm';
import { PerformanceRow } from './PerformanceRow';
import type { SeasonItem } from './SeasonHeader';

type Props = {
  season: SeasonItem;
  seasons: SeasonWithPerformancesWithDates[];
  showForm: boolean;
  editingPerformance: PerformanceWithDates | null;
  onCloseFormAction: () => void;
  onSavePerformanceAction: (performance: PerformanceWithDates) => void;
  onAddPerformanceAction: () => void;
  onEditPerformanceAction: (performance: PerformanceWithDates) => void;
  onDeletePerformanceAction: (id: string) => void;
};

// Représentations d'une saison (plus récente d'abord) ; saison inactive = lecture seule
export function SeasonContent({
  season,
  seasons,
  showForm,
  editingPerformance,
  onCloseFormAction,
  onSavePerformanceAction,
  onAddPerformanceAction,
  onEditPerformanceAction,
  onDeletePerformanceAction,
}: Props) {
  const isLocked = !season.active && !season.isVirtual;
  const performances = [...season.performances].sort((a, b) => {
    const aDate = a.performance_dates[0]?.date ?? '';
    const bDate = b.performance_dates[0]?.date ?? '';
    return aDate > bDate ? -1 : 1;
  });

  return (
    <div className="p-6 flex flex-col gap-4">
      {season.isVirtual && (
        <p className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
          Ces représentations n&apos;ont plus de saison. Modifiez-les pour les réaffecter.
        </p>
      )}

      {showForm && (
        <PerformanceForm
          performance={editingPerformance}
          seasonId={season.isVirtual ? null : season.id}
          seasons={seasons}
          onClose={onCloseFormAction}
          onSave={onSavePerformanceAction}
        />
      )}

      {season.performances.length === 0 && !showForm && (
        <p className="text-sm text-foreground/50 text-center py-4">
          Aucune représentation pour cette saison.
        </p>
      )}

      {performances.map((performance) => (
        <PerformanceRow
          key={performance.id}
          performance={performance}
          isLocked={isLocked}
          onEdit={() => onEditPerformanceAction(performance)}
          onDelete={() => onDeletePerformanceAction(performance.id)}
        />
      ))}

      {!showForm && !isLocked && (
        <Button variant="outline" size="sm" onClick={onAddPerformanceAction} className="self-start">
          + Ajouter une représentation
        </Button>
      )}

      {isLocked && (
        <p className="text-xs text-foreground/40 italic">
          Saison verrouillée — activez-la pour modifier les représentations.
        </p>
      )}
    </div>
  );
}
