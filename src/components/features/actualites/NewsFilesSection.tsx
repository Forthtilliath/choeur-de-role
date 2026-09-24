'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { useConfirm } from '@/context/ConfirmContext';

import { deleteNewsFile, uploadNewsFile } from './clientQueries';
import type { NewsFile } from './types';

type Props = {
  newsId: string;
  files: NewsFile[];
  onFilesChangeAction: (update: (prev: NewsFile[]) => NewsFile[]) => void;
};

// Documents joints d'une actualité existante : libellé optionnel puis upload
export function NewsFilesSection({ newsId, files, onFilesChangeAction }: Props) {
  const [uploading, setUploading] = useState(false);
  const [newFileLabel, setNewFileLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirm = useConfirm();

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const label = newFileLabel.trim() || file.name;
    setUploading(true);
    const uploaded = await uploadNewsFile(newsId, file, label);
    if (uploaded) {
      onFilesChangeAction((prev) => [...prev, uploaded]);
      setNewFileLabel('');
      toast.success('Fichier ajouté');
    } else {
      toast.error("Erreur lors de l'upload du fichier");
    }
    setUploading(false);
    e.target.value = '';
  }

  async function handleDeleteFile(id: string) {
    if (!(await confirm({ message: 'Supprimer ce fichier ?', danger: true }))) return;
    const ok = await deleteNewsFile(id);
    if (ok) {
      onFilesChangeAction((prev) => prev.filter((f) => f.id !== id));
      toast.success('Fichier supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-2 border-t border-border">
      <span className="text-sm font-medium text-foreground">Documents joints</span>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-background"
            >
              <span className="text-sm text-foreground flex-1 truncate">📎 {f.label}</span>
              <a
                href={f.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2.5 py-1 rounded-md border border-border text-foreground/60 hover:text-primary hover:border-primary transition-colors no-underline shrink-0"
              >
                Voir
              </a>
              <button
                type="button"
                onClick={() => handleDeleteFile(f.id)}
                className="text-xs px-2.5 py-1 rounded-md border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newFileLabel}
          onChange={(e) => setNewFileLabel(e.target.value)}
          placeholder="Libellé (ex : Convocation AG 2025)"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className={`shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
            uploading
              ? 'border-border text-foreground/40 cursor-not-allowed'
              : 'border-primary text-primary hover:bg-primary/5 cursor-pointer'
          }`}
        >
          {uploading ? 'Upload…' : '+ Fichier'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleUploadFile}
          disabled={uploading}
          className="hidden"
        />
      </div>
      <p className="text-xs text-foreground/40">
        Saisissez un libellé puis cliquez sur &ldquo;+ Fichier&rdquo;. Sans libellé, le nom du
        fichier est utilisé.
      </p>
    </div>
  );
}
