'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';

import { insertSeason } from '../clientQueries';
import type { SeasonWithPerformancesWithDates } from '../types';

type Props = {
  onAddedAction: (season: SeasonWithPerformancesWithDates) => void;
};

// Bouton « Nouvelle saison » qui se déplie en champ de saisie inline
export function AddSeasonForm({ onAddedAction }: Props) {
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [newSeasonLabel, setNewSeasonLabel] = useState('');
  const [savingSeason, setSavingSeason] = useState(false);

  async function handleAddSeason() {
    if (!newSeasonLabel.trim()) return;
    setSavingSeason(true);
    const data = await insertSeason(newSeasonLabel.trim());
    if (data) {
      onAddedAction({ ...data, performances: [] });
      setNewSeasonLabel('');
      setShowSeasonForm(false);
    }
    setSavingSeason(false);
  }

  if (!showSeasonForm) {
    return (
      <Button variant="outline" size="sm" onClick={() => setShowSeasonForm(true)}>
        + Nouvelle saison
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        value={newSeasonLabel}
        onChange={(e) => setNewSeasonLabel(e.target.value)}
        placeholder="2026-2027"
        className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAddSeason();
          if (e.key === 'Escape') setShowSeasonForm(false);
        }}
        autoFocus
      />
      <Button size="sm" onClick={handleAddSeason} disabled={savingSeason || !newSeasonLabel.trim()}>
        {savingSeason ? '...' : 'Ajouter'}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setShowSeasonForm(false)}>
        Annuler
      </Button>
    </div>
  );
}
