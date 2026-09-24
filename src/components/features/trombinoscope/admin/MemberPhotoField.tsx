'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { useImagePreview } from '@/hooks/useImagePreview';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';

import type { AdminMemberWithSeasons } from '../types';

type Props = {
  member: AdminMemberWithSeasons;
  onPhotoUpdateAction?: (memberId: string, photoUrl: string) => void;
};

export function MemberPhotoField({ member, onPhotoUpdateAction }: Props) {
  const [photoUrl, setPhotoUrl] = useState(member.photo_url ?? '');
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const {
    previewUrl: photoPreviewUrl,
    isPending: photoIsPending,
    uploading: photoUploading,
    handleSelect: handlePhotoSelect,
    confirm: confirmPhoto,
    cancel: cancelPhoto,
  } = useImagePreview(async (file) => {
    let publicUrl: string;
    try {
      publicUrl = await uploadImageToR2(file, `members/${member.id}.webp`);
    } catch {
      toast.error("Erreur lors de l'upload de la photo");
      throw new Error('Upload failed');
    }
    const url = `${publicUrl}?t=${Date.now()}`;
    const res = await fetch('/api/admin/update-member-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: member.id, photoUrl: url }),
    });
    if (!res.ok) {
      toast.error('Erreur lors de la mise à jour de la photo');
      throw new Error('DB update failed');
    }
    setPhotoUrl(url);
    setPhotoSuccess(true);
    setTimeout(() => setPhotoSuccess(false), 3000);
    onPhotoUpdateAction?.(member.id, url);
    toast.success('Photo mise à jour');
  });

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-border">
      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-background-secondary shrink-0">
        {(photoPreviewUrl ?? photoUrl) ? (
          <Image
            src={photoPreviewUrl ?? photoUrl}
            alt={`${member.first_name} ${member.last_name}`}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/30 text-2xl">
            👤
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-foreground/50">Photo de profil</p>
        {photoIsPending ? (
          <div className="flex gap-2">
            <Button type="button" size="sm" disabled={photoUploading} onClick={confirmPhoto}>
              {photoUploading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Upload...
                </span>
              ) : (
                'Confirmer'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={photoUploading}
              onClick={cancelPhoto}
            >
              Annuler
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => photoInputRef.current?.click()}
          >
            {photoUrl ? '📷 Changer la photo' : '📷 Ajouter une photo'}
          </Button>
        )}
        {photoSuccess && <p className="text-xs text-primary">✓ Photo enregistrée</p>}
      </div>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoSelect}
        className="hidden"
      />
    </div>
  );
}
