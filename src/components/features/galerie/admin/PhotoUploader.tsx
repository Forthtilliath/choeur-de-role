'use client';

import { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type PendingPhoto = { file: File; previewUrl: string };

type Props = {
  uploading: boolean;
  onUploadAction: (files: File[]) => void;
};

// Sélection multiple de photos, aperçu puis validation de l'envoi
export function PhotoUploader({ uploading, onUploadAction }: Props) {
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);

  function handlePhotosSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos(
      Array.from(files).map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    );
    e.target.value = '';
  }

  function clearPending() {
    pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPendingPhotos([]);
  }

  function confirmPhotos() {
    if (pendingPhotos.length === 0) return;
    onUploadAction(pendingPhotos.map((p) => p.file));
    clearPending();
  }

  return (
    <div>
      <span className="text-xs text-foreground/50 mb-2 block">Ajouter des photos</span>
      {pendingPhotos.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            {pendingPhotos.map((p) => (
              <div
                key={p.previewUrl}
                className="relative w-16 h-16 rounded-lg overflow-hidden bg-background-tertiary"
              >
                <Image src={p.previewUrl} alt="" fill className="object-cover" sizes="64px" />
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/50">
            {pendingPhotos.length} photo{pendingPhotos.length > 1 ? 's' : ''} sélectionnée
            {pendingPhotos.length > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" disabled={uploading} onClick={confirmPhotos}>
              ✓ Valider l&apos;envoi
            </Button>
            <Button size="sm" variant="danger" disabled={uploading} onClick={clearPending}>
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <label
          className={cn(
            'cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed transition-colors text-sm',
            uploading
              ? 'border-primary text-primary bg-primary/5 pointer-events-none'
              : 'border-border text-foreground/50 hover:border-primary hover:bg-primary/5 hover:text-primary',
          )}
        >
          {uploading ? '⏳ Upload en cours...' : '📷 Choisir des photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={handlePhotosSelect}
          />
        </label>
      )}
    </div>
  );
}
