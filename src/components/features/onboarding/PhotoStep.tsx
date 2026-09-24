'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { uploadProfilePhoto } from '@/components/features/profil/clientQueries';
import { Button } from '@/components/ui/Button';
import { useImagePreview } from '@/hooks/useImagePreview';

import { StepHeader, StepNav } from './OnboardingLayout';

type Props = {
  memberId: string;
  initialPhotoUrl: string;
  onNextAction: () => void;
};

export function PhotoStep({ memberId, initialPhotoUrl, onNextAction }: Props) {
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
      toast.error("Erreur lors de l'upload");
      throw new Error('Upload failed');
    }
    setPhotoUrl(url);
    toast.success('Photo enregistrée');
  });

  return (
    <div className="flex flex-col gap-6">
      <StepHeader eyebrow="Étape 1 sur 3" title="Photo de profil">
        Votre photo apparaîtra sur le trombinoscope. Elle aide les autres membres à vous
        reconnaître.
      </StepHeader>

      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-background-secondary border-2 border-border">
          {(photoPreviewUrl ?? photoUrl) ? (
            <Image
              src={photoPreviewUrl ?? photoUrl}
              alt="Photo de profil"
              fill
              className="object-cover"
              sizes="128px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-foreground/20">
              👤
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          {photoIsPending ? (
            <div className="flex gap-2">
              <Button variant="primary" disabled={photoUploading} onClick={confirmPhoto}>
                {photoUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Upload en cours...
                  </span>
                ) : (
                  '✓ Valider la photo'
                )}
              </Button>
              <Button variant="danger" disabled={photoUploading} onClick={cancelPhoto}>
                Annuler
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => photoInputRef.current?.click()}>
              {photoUrl ? '📷 Changer la photo' : '📷 Choisir une photo'}
            </Button>
          )}
          <p className="text-xs text-foreground/40">JPG, PNG — format carré recommandé</p>
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
        />
      </div>

      <StepNav onNextAction={onNextAction} disabled={photoUploading} />
    </div>
  );
}
