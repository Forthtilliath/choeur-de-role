'use client';

import { useState } from 'react';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Tables } from '@/types/database';
import {
  insertSeason,
  updateSeasonLabel,
  toggleSeasonActive,
  deactivateSeasons,
  deleteSeason,
} from '../clientQueries';

type Season = Tables<'seasons'>;

type Props = {
  initialSeasons: Season[];
};

export function SaisonsAdminClient({ initialSeasons }: Props) {
  const [seasons, setSeasons] = useState<Season[]>(initialSeasons);
  const [showForm, setShowForm] = useState(false);
  const [editingLabel, setEditingLabel] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeError, setActiveError] = useState('');
  const confirm = useConfirm();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editingId) {
      const data = await updateSeasonLabel(editingId, editingLabel);
      if (data) {
        setSeasons((prev) => prev.map((s) => (s.id === editingId ? data : s)));
        toast.success('Saison modifiée');
      } else {
        toast.error('Erreur lors de la modification');
      }
    } else {
      const data = await insertSeason(editingLabel);
      if (data) {
        setSeasons((prev) => [data, ...prev]);
        toast.success('Saison ajoutée');
      } else {
        toast.error("Erreur lors de la création de la saison");
      }
    }

    setShowForm(false);
    setEditingLabel('');
    setEditingId(null);
    setSaving(false);
  }

  async function handleToggleActive(season: Season) {
    setActiveError('');

    if (!season.active) {
      const otherActiveIds = seasons.filter((s) => s.active && s.id !== season.id).map((s) => s.id);
      await deactivateSeasons(otherActiveIds);
      const ok = await toggleSeasonActive(season.id, true);
      if (ok) {
        setSeasons((prev) => prev.map((s) => ({ ...s, active: s.id === season.id })));
        toast.success('Saison activée');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } else {
      const ok = await toggleSeasonActive(season.id, false);
      if (ok) {
        setSeasons((prev) => prev.map((s) => (s.id === season.id ? { ...s, active: false } : s)));
        toast.success('Saison désactivée');
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    }
  }

  async function handleDelete(id: string) {
    if (
      !await confirm({
        message: 'Supprimer cette saison ? Les représentations seront déplacées dans "Sans saison".',
        danger: true,
      })
    )
      return;
    const ok = await deleteSeason(id);
    if (ok) {
      setSeasons((prev) => prev.filter((s) => s.id !== id));
      toast.success('Saison supprimée');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  function handleEdit(season: Season) {
    setEditingId(season.id);
    setEditingLabel(season.label);
    setShowForm(true);
  }

  return (
    <div>
      {activeError && (
        <p className="mb-4 text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
          {activeError}
        </p>
      )}

      {/* Bouton ajouter */}
      <div className="flex justify-end mb-6">
        <Button
          onClick={() => {
            setEditingId(null);
            setEditingLabel('');
            setShowForm(true);
          }}
        >
          + Ajouter une saison
        </Button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="border border-border rounded-2xl p-6 mb-8 bg-background-secondary">
          <h2 className="text-lg font-medium mb-4 text-foreground">
            {editingId ? 'Modifier la saison' : 'Ajouter une saison'}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground">Label</label>
              <input
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                required
                placeholder="2025-2026"
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              />
              <p className="text-xs text-foreground/50">Format recommandé : 2025-2026</p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingLabel('');
                  setEditingId(null);
                }}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving} loading={saving}>
                {saving ? 'Sauvegarde...' : editingId ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="flex flex-col gap-3">
        {seasons.map((season) => (
          <div
            key={season.id}
            className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-border bg-background"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{season.label}</p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${season.active ? 'bg-primary/10 text-primary' : 'bg-foreground/10 text-foreground/40'}`}
              >
                {season.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => handleEdit(season)}>
                Modifier
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleToggleActive(season)}>
                {season.active ? 'Désactiver' : 'Activer'}
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(season.id)}>
                Supprimer
              </Button>
            </div>
          </div>
        ))}

        {seasons.length === 0 && (
          <p className="text-center text-foreground/50 py-12">Aucune saison pour le moment.</p>
        )}
      </div>
    </div>
  );
}
