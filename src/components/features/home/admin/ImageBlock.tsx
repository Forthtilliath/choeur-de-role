'use client';

import { useState } from 'react';
import Image from 'next/image';

// Image d'un bloc : aperçu local à valider avant upload, choix du ratio
export function ImageBlock({
  imageUrl,
  ratio,
  onUpload,
  onRemove,
  onChangeRatio,
}: {
  imageUrl: string | null;
  ratio: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onChangeRatio?: (ratio: '4/3' | '3/4') => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setPendingFile(file);
    e.target.value = '';
  }

  function handleConfirm() {
    if (!pendingFile) return;
    onUpload(pendingFile);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  }

  function handleCancelPreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
  }

  const displayUrl = previewUrl ?? imageUrl;
  const isPending = pendingFile !== null;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`relative rounded-2xl overflow-hidden ${ratio} bg-background-tertiary flex items-center justify-center group`}
      >
        {displayUrl ? (
          <>
            <Image
              src={displayUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {isPending ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3">
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:opacity-80 text-white text-xs font-medium"
                >
                  ✓ Valider
                </button>
                <button
                  onClick={handleCancelPreview}
                  className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-medium"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white text-xs">
                  Changer
                  <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
                </label>
                <button
                  onClick={onRemove}
                  className="px-3 py-1.5 rounded-lg bg-red-500/70 hover:bg-red-500 text-white text-xs"
                >
                  Supprimer
                </button>
              </div>
            )}
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2 text-foreground/40 hover:text-foreground/70 transition-colors">
            <span className="text-3xl">📷</span>
            <span className="text-sm">Ajouter une photo</span>
            <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Sélecteur ratio — uniquement si image présente et callback fourni */}
      {displayUrl && onChangeRatio && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onChangeRatio('4/3')}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${ratio === 'aspect-4/3' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50'}`}
          >
            Paysage (4/3)
          </button>
          <button
            onClick={() => onChangeRatio('3/4')}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${ratio === 'aspect-3/4' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50'}`}
          >
            Portrait (3/4)
          </button>
        </div>
      )}
    </div>
  );
}
