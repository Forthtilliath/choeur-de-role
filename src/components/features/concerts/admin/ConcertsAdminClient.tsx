'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useConfirm } from '@/context/ConfirmContext';

import {
  deletePerformance,
  deleteSeason,
  toggleSeasonActive,
  updateSeasonLabel,
} from '../clientQueries';
import type { PerformanceWithDates, SeasonWithPerformancesWithDates } from '../types';

import { AddSeasonForm } from './AddSeasonForm';
import { SeasonContent } from './SeasonContent';
import type { SeasonItem } from './SeasonHeader';
import { SeasonHeader } from './SeasonHeader';

type Props = {
  initialSeasons: SeasonWithPerformancesWithDates[];
  initialOrphaned: PerformanceWithDates[];
  editPerformanceId?: PerformanceWithDates['id'] | null;
};

function findInitialEdit(
  seasons: SeasonWithPerformancesWithDates[],
  orphaned: PerformanceWithDates[],
  editId: PerformanceWithDates['id'] | null,
) {
  if (!editId) return null;
  for (const season of seasons) {
    const perf = season.performances.find((p) => p.id === editId);
    if (perf) return { seasonId: season.id, perf };
  }
  const perf = orphaned.find((p) => p.id === editId);
  if (perf) return { seasonId: 'orphaned', perf };
  return null;
}

export function ConcertsAdminClient({ initialSeasons, initialOrphaned, editPerformanceId }: Props) {
  const [seasons, setSeasons] = useState<SeasonWithPerformancesWithDates[]>(initialSeasons);
  const [orphaned, setOrphaned] = useState<PerformanceWithDates[]>(initialOrphaned);

  const initialEdit = findInitialEdit(initialSeasons, initialOrphaned, editPerformanceId ?? null);

  const [openSeasonId, setOpenSeasonId] = useState<string | null>(
    initialEdit?.seasonId ??
      initialSeasons.find((s) => s.active)?.id ??
      initialSeasons[0]?.id ??
      null,
  );

  const [showPerformanceForm, setShowPerformanceForm] = useState(!!initialEdit);
  const [editingPerformance, setEditingPerformance] = useState<PerformanceWithDates | null>(
    initialEdit?.perf ?? null,
  );
  const [targetSeasonId, setTargetSeasonId] = useState<string | null>(
    initialEdit?.seasonId ?? null,
  );

  const [activeError, setActiveError] = useState('');
  const confirm = useConfirm();

  // Renommage saison
  const [renamingSeasonId, setRenamingSeasonId] = useState<string | null>(null);
  const [renameLabel, setRenameLabel] = useState('');

  async function handleRenameSeason(id: string) {
    if (!renameLabel.trim()) return;
    const data = await updateSeasonLabel(id, renameLabel.trim());
    if (data) {
      setSeasons((prev) =>
        prev.map((s) => (s.id === id ? { ...s, label: renameLabel.trim() } : s)),
      );
      toast.success('Saison renommée');
    } else {
      toast.error('Erreur lors du renommage');
    }
    setRenamingSeasonId(null);
    setRenameLabel('');
  }

  async function handleToggleActive(season: SeasonWithPerformancesWithDates) {
    setActiveError('');
    const newActive = !season.active;
    if (newActive) {
      const activeCount = seasons.filter((s) => s.active).length;
      if (activeCount >= 2) {
        setActiveError('Maximum 2 saisons actives simultanément.');
        return;
      }
    }
    const ok = await toggleSeasonActive(season.id, newActive);
    if (ok) {
      setSeasons((prev) => prev.map((s) => (s.id === season.id ? { ...s, active: newActive } : s)));
      toast.success(newActive ? 'Saison activée' : 'Saison désactivée');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  async function handleDeleteSeason(season: SeasonWithPerformancesWithDates) {
    const message =
      season.performances.length > 0
        ? `Les ${season.performances.length} représentation(s) seront déplacées dans "Sans saison" et pourront être réaffectées.`
        : `Cette action est irréversible.`;
    if (
      !(await confirm({
        title: `Supprimer la saison "${season.label}" ?`,
        message,
        confirmLabel: 'Supprimer',
        danger: true,
      }))
    )
      return;

    const ok = await deleteSeason(season.id);
    if (ok) {
      // Les performances sont automatiquement passées à season_id = null (ON DELETE SET NULL)
      setOrphaned((prev) => [
        ...prev,
        ...season.performances.map((p) => ({ ...p, season_id: null })),
      ]);
      setSeasons((prev) => prev.filter((s) => s.id !== season.id));
      if (openSeasonId === season.id) setOpenSeasonId('orphaned');
      toast.success('Saison supprimée');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleAddPerformance(seasonId: string) {
    setTargetSeasonId(seasonId);
    setEditingPerformance(null);
    setShowPerformanceForm(true);
  }

  function handleEditPerformance(performance: PerformanceWithDates, seasonId: string) {
    setTargetSeasonId(seasonId);
    setEditingPerformance(performance);
    setShowPerformanceForm(true);
    setOpenSeasonId(seasonId);
  }

  function handleSavePerformance(performance: PerformanceWithDates) {
    const newSeasonId = performance.season_id;

    setSeasons((prev) =>
      prev.map((season) => {
        const withoutPerf = {
          ...season,
          performances: season.performances.filter((p) => p.id !== performance.id),
        };
        if (season.id === newSeasonId) {
          return { ...withoutPerf, performances: [...withoutPerf.performances, performance] };
        }
        return withoutPerf;
      }),
    );

    // Retirer des orphelins si réaffectée à une saison
    if (newSeasonId) {
      setOrphaned((prev) => prev.filter((p) => p.id !== performance.id));
    } else {
      // Ajouter aux orphelins si saison_id = null
      setOrphaned((prev) => {
        const exists = prev.find((p) => p.id === performance.id);
        if (exists) return prev.map((p) => (p.id === performance.id ? performance : p));
        return [...prev, performance];
      });
    }

    setShowPerformanceForm(false);
    setEditingPerformance(null);
  }

  async function handleDeletePerformance(id: string, fromSeasonId: string | null) {
    if (
      !(await confirm({
        message: 'Supprimer cette représentation et toutes ses dates ?',
        danger: true,
      }))
    )
      return;
    const ok = await deletePerformance(id);
    if (ok) {
      if (fromSeasonId === 'orphaned' || fromSeasonId === null) {
        setOrphaned((prev) => prev.filter((p) => p.id !== id));
      } else {
        setSeasons((prev) =>
          prev.map((season) =>
            season.id === fromSeasonId
              ? { ...season, performances: season.performances.filter((p) => p.id !== id) }
              : season,
          ),
        );
      }
      toast.success('Représentation supprimée');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  const allSeasonItems: SeasonItem[] = [
    ...seasons,
    ...(orphaned.length > 0
      ? [
          {
            id: 'orphaned',
            label: 'Sans saison',
            active: false,
            performances: orphaned,
            isVirtual: true,
            created_at: null,
          },
        ]
      : []),
  ];

  function cancelRename() {
    setRenamingSeasonId(null);
    setRenameLabel('');
  }

  function closePerformanceForm() {
    setShowPerformanceForm(false);
    setEditingPerformance(null);
  }

  return (
    <div className="flex flex-col gap-4">
      {activeError && (
        <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
          {activeError}
        </p>
      )}

      {allSeasonItems.length === 0 && (
        <div className="text-center py-12 text-foreground/50">
          <p className="mb-4">Aucune saison. Créez-en une d&apos;abord.</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <AddSeasonForm onAddedAction={(season) => setSeasons((prev) => [season, ...prev])} />
      </div>

      {allSeasonItems.map((season) => (
        <div key={season.id} className="border border-border rounded-2xl overflow-hidden">
          <SeasonHeader
            season={season}
            isOpen={openSeasonId === season.id}
            onToggleOpenAction={() =>
              setOpenSeasonId(openSeasonId === season.id ? null : season.id)
            }
            isRenaming={renamingSeasonId === season.id}
            renameLabel={renameLabel}
            onRenameLabelChangeAction={setRenameLabel}
            onStartRenameAction={() => {
              setRenamingSeasonId(season.id);
              setRenameLabel(season.label);
            }}
            onConfirmRenameAction={() => handleRenameSeason(season.id)}
            onCancelRenameAction={cancelRename}
            onToggleActiveAction={() => handleToggleActive(season)}
            onDeleteAction={() => handleDeleteSeason(season)}
          />

          {openSeasonId === season.id && (
            <SeasonContent
              season={season}
              seasons={seasons}
              showForm={showPerformanceForm && targetSeasonId === season.id}
              editingPerformance={editingPerformance}
              onCloseFormAction={closePerformanceForm}
              onSavePerformanceAction={handleSavePerformance}
              onAddPerformanceAction={() => handleAddPerformance(season.id)}
              onEditPerformanceAction={(performance) =>
                handleEditPerformance(performance, season.id)
              }
              onDeletePerformanceAction={(id) =>
                handleDeletePerformance(id, season.isVirtual ? null : season.id)
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
