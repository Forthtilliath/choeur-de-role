'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useImagePreview } from '@/hooks/useImagePreview';

import { uploadProfilePhoto } from './clientQueries';

type Props = {
  memberId: string;
  initialPhotoUrl: string;
  alt: string;
};

// Photo de profil : aperçu local puis validation explicite avant upload
export function ProfilePhotoSection({ memberId, initialPhotoUrl, alt }: Props) {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const {
    previewUrl: photoPreviewUrl,
    isPending: photoIsPending,
    uploading: photoUploading,
    handleSelect: handlePhotoSelect,
    confirm: confirmPhoto,
    cancel: cancelPhoto,
  } = useImagePreview(async (file) => {
    const url = await uploadProfilePhoto(memberId, file);
    if (!url) {
      toast.error("Erreur lors de l'upload de la photo");
      throw new Error('Upload failed');
    }
    setPhotoUrl(url);
    toast.success('Photo de profil mise à jour');
  });

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-background-secondary shrink-0">
        {(photoPreviewUrl ?? photoUrl) ? (
          <Image
            src={photoPreviewUrl ?? photoUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="96px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl text-foreground/30">
            👤
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Photo de profil</p>
        <p className="text-xs text-foreground/50">JPG, PNG — recommandé : format carré</p>
        {photoIsPending ? (
          <div className="flex gap-2">
            <Button variant="primary" size="sm" disabled={photoUploading} onClick={confirmPhoto}>
              {photoUploading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Upload...
                </span>
              ) : (
                '✓ Valider'
              )}
            </Button>
            <Button variant="danger" size="sm" disabled={photoUploading} onClick={cancelPhoto}>
              Annuler
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => photoInputRef.current?.click()}>
            {photoUrl ? '📷 Changer la photo' : '📷 Ajouter une photo'}
          </Button>
        )}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
