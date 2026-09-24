'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useConfirm } from '@/context/ConfirmContext';

import { deleteEventFile, uploadEventFile } from '../clientQueries';
import type { ExternalEvent } from '../types';

type EventFile = ExternalEvent['external_event_files'][number];

type Props = {
  eventId: string;
  files: EventFile[];
  onFilesChangeAction: (update: (prev: EventFile[]) => EventFile[]) => void;
};

// Fichiers joints d'un évènement existant (label obligatoire)
export function EventFilesSection({ eventId, files, onFilesChangeAction }: Props) {
  const [newFileLabel, setNewFileLabel] = useState('');
  const [newFileInput, setNewFileInput] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const confirm = useConfirm();

  async function handleAddFile() {
    if (!newFileInput || !newFileLabel.trim()) return;
    setUploadingFile(true);
    const file = await uploadEventFile(eventId, newFileInput, newFileLabel.trim(), files.length);
    if (file) {
      onFilesChangeAction((prev) => [...prev, file]);
      toast.success('Fichier ajouté');
    } else {
      toast.error("Erreur lors de l'upload du fichier");
    }
    setNewFileLabel('');
    setNewFileInput(null);
    setUploadingFile(false);
  }

  async function handleDeleteFile(id: string, label: string) {
    if (!(await confirm({ message: `Supprimer "${label}" ?`, danger: true }))) return;
    const ok = await deleteEventFile(id);
    if (ok) {
      onFilesChangeAction((prev) => prev.filter((f) => f.id !== id));
      toast.success('Fichier supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-foreground">Fichiers joints</span>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <span className="flex-1 truncate text-foreground/70">📎 {f.label}</span>
              <a
                href={f.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:opacity-70"
              >
                Voir
              </a>
              <button
                type="button"
                onClick={() => handleDeleteFile(f.id, f.label)}
                className="text-foreground/30 hover:text-red-500 transition-colors text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <input
          value={newFileLabel}
          onChange={(e) => setNewFileLabel(e.target.value)}
          placeholder="Label du fichier..."
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
        />
        <label className="cursor-pointer shrink-0">
          <div className="px-3 py-2 border border-border rounded-lg text-sm text-foreground/60 hover:border-primary hover:text-primary transition-all bg-background">
            {newFileInput ? '✓ Fichier sélectionné' : '📎 Choisir'}
          </div>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setNewFileInput(e.target.files?.[0] ?? null)}
          />
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!newFileInput || !newFileLabel.trim() || uploadingFile}
          onClick={handleAddFile}
        >
          {uploadingFile ? '...' : 'Ajouter'}
        </Button>
      </div>
      <p className="text-xs text-foreground/30">
        Les fichiers sont disponibles sur la page publique de l&apos;évènement.
      </p>
    </div>
  );
}
