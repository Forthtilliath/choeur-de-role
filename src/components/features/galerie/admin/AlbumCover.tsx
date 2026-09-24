'use client';

import { useState } from 'react';
import Image from 'next/image';

type Props = {
  coverUrl: string | null;
  onUploadAction: (file: File) => void;
  onRemoveAction: () => void;
};

// Vignette de couverture : aperçu local à valider avant upload
export function AlbumCover({ coverUrl, onUploadAction, onRemoveAction }: Props) {
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(URL.createObjectURL(f));
    setPendingCoverFile(f);
  }

  function clearPreview() {
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    setCoverPreviewUrl(null);
    setPendingCoverFile(null);
  }

  function confirmCover() {
    if (!pendingCoverFile) return;
    onUploadAction(pendingCoverFile);
    clearPreview();
  }

  return (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-background-tertiary shrink-0 group">
      {coverPreviewUrl ? (
        <>
          <Image src={coverPreviewUrl} alt="" fill className="object-cover" sizes="48px" />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
            <button
              onClick={confirmCover}
              aria-label="Valider la couverture"
              className="text-emerald-400 hover:text-emerald-300 text-xs"
            >
              ✓
            </button>
            <button
              onClick={clearPreview}
              aria-label="Annuler"
              className="text-red-400 hover:text-red-300 text-xs"
            >
              ✕
            </button>
          </div>
        </>
      ) : coverUrl ? (
        <>
          <Image src={coverUrl} alt="" fill className="object-cover" sizes="48px" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
            <label className="cursor-pointer text-white text-xs hover:underline">
              ✏️
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
            </label>
            <button
              onClick={onRemoveAction}
              aria-label="Supprimer la couverture"
              className="text-white text-xs hover:underline"
            >
              ✕
            </button>
          </div>
        </>
      ) : (
        <label className="w-full h-full flex items-center justify-center cursor-pointer text-foreground/30 hover:text-foreground/60 transition-colors">
          <span className="text-lg">📷</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
        </label>
      )}
    </div>
  );
}
