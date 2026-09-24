'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';

import { upsertVoicePart } from './clientQueries';
import type { VoicePart } from './types';

export function VoicePartForm({
  part,
  onClose,
  onSave,
  nextOrderIndex,
  existingGroups,
}: {
  part: VoicePart | null;
  onClose: () => void;
  onSave: (part: VoicePart) => void;
  nextOrderIndex: number;
  existingGroups: string[];
}) {
  const [name, setName] = useState(part?.name ?? '');
  const [groupName, setGroupName] = useState(part?.group_name ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const saved = await upsertVoicePart(
      { name, group_name: groupName || null },
      part?.id,
      nextOrderIndex,
    );
    if (saved) {
      onSave(saved);
      toast.success(part ? 'Pupitre modifié' : 'Pupitre ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-4 text-foreground">
        {part ? 'Modifier le pupitre' : 'Ajouter un pupitre'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="pupitre-name" className="text-sm font-medium text-foreground">
              Nom
            </label>
            <input
              id="pupitre-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Ténor"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="pupitre-group" className="text-sm font-medium text-foreground">
              Groupe <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              id="pupitre-group"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              list="groups-list"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Hommes"
            />
            {existingGroups.length > 0 && (
              <datalist id="groups-list">
                {existingGroups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            )}
          </div>
        </div>
        <p className="text-xs text-foreground/40">
          Le groupe est utilisé pour afficher &quot;Hommes&quot; quand Ténor ET Basse sont liés à un
          fichier. Glissez-déposez les pupitres ou les groupes pour les réordonner.
        </p>
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : part ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
