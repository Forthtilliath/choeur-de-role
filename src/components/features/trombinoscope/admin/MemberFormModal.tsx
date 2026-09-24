'use client';

import { useEffect } from 'react';

import type { Season } from '../../concerts';
import type { AdminMemberWithSeasons, VoicePart } from '../types';

import { CreateMemberForm } from './CreateMemberForm';
import { MemberForm } from './MemberForm';

type Props = {
  editingMember: AdminMemberWithSeasons | null;
  isEmailConfirmed: boolean;
  voiceParts: VoicePart[];
  seasons: Season[];
  currentUserRole: string;
  onCloseAction: () => void;
  onSaveAction: (member: AdminMemberWithSeasons) => void;
  onPhotoUpdateAction: (memberId: string, photoUrl: string) => void;
};

export function MemberFormModal({
  editingMember,
  isEmailConfirmed,
  voiceParts,
  seasons,
  currentUserRole,
  onCloseAction,
  onSaveAction,
  onPhotoUpdateAction,
}: Props) {
  // Bloque le défilement de la page tant que la modale est ouverte
  useEffect(() => {
    document.documentElement.style.overflowY = 'hidden';
    return () => {
      document.documentElement.style.overflowY = '';
    };
  }, []);

  return (
    // Backdrop click-to-dismiss — Escape non géré ici, la croix du formulaire suffit.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCloseAction();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {editingMember ? (
          <MemberForm
            key={editingMember.id}
            member={editingMember}
            voiceParts={voiceParts}
            currentUserRole={currentUserRole}
            isEmailConfirmed={isEmailConfirmed}
            onCloseAction={onCloseAction}
            onSaveAction={onSaveAction}
            onPhotoUpdateAction={onPhotoUpdateAction}
            seasons={seasons}
          />
        ) : (
          <CreateMemberForm
            voiceParts={voiceParts}
            seasons={seasons}
            onCloseAction={onCloseAction}
            onSuccessAction={onSaveAction}
          />
        )}
      </div>
    </div>
  );
}
