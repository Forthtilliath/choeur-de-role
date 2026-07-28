'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { upsertSong } from '../clientQueries';
import { Performance, Song } from '../types';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';

export function SongForm({
  song,
  performances,
  onCloseAction,
  onSaveAction,
}: {
  song: Song | null;
  performances: Performance[];
  onCloseAction: () => void;
  onSaveAction: (song: Song) => void;
}) {
  const [title, setTitle] = useState(song?.title ?? '');
  const [composer, setComposer] = useState(song?.composer ?? '');
  const [label, setLabel] = useState(song?.label ?? '');
  const [selectedPerformances, setSelectedPerformances] = useState<string[]>(
    song?.song_performance
      .map((sp) => sp.performance_id)
      .filter((id): id is string => id !== null) ?? [],
  );
  const [saving, setSaving] = useState(false);
  const formRef = useFormShortcuts(onCloseAction);

  function togglePerformance(id: string) {
    setSelectedPerformances((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data = await upsertSong(
      song
        ? { id: song.id, title, composer: composer || null, label: label || null }
        : { title, composer: composer || null, label: label || null },
      selectedPerformances,
    );
    if (data) {
      onSaveAction({
        ...data,
        song_files: song?.song_files ?? [],
        song_performance: selectedPerformances.map((p) => ({ performance_id: p })),
      } as Song);
      toast.success(song ? 'Chant modifié' : 'Chant ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-5 text-foreground">
        {song ? 'Modifier le chant' : 'Ajouter un chant'}
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Alors on danse"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">
              Compositeur <span className="text-foreground/40 font-normal">(optionnel)</span>
            </label>
            <input
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Stromae"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            Label <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Version concert 2026"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">Représentations</label>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {performances.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePerformance(p.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm border transition-all text-left ${selectedPerformances.includes(p.id) ? 'border-primary bg-primary/10' : 'border-border'}`}
              >
                <span
                  className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${selectedPerformances.includes(p.id) ? 'bg-primary border-primary' : 'border-border'}`}
                >
                  {selectedPerformances.includes(p.id) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </span>
                <span
                  className={
                    selectedPerformances.includes(p.id) ? 'text-primary' : 'text-foreground'
                  }
                >
                  {p.title}
                </span>
                {p.seasons && (
                  <span className="text-xs text-foreground/40 ml-auto">{p.seasons.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onCloseAction}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : song ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
