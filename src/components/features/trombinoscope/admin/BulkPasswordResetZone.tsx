'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useConfirm } from '@/context/ConfirmContext';

import { resetAllMembersPasswords } from '../clientQueries';

export function BulkPasswordResetZone() {
  const confirm = useConfirm();
  const [bulkResetting, setBulkResetting] = useState(false);
  const [bulkResetResult, setBulkResetResult] = useState<number | null>(null);

  async function handleBulkPasswordResetClick() {
    const ok = await confirm({
      title: 'Réinitialiser tous les mots de passe',
      message:
        'Tous les choristes ayant un compte confirmé recevront immédiatement un email avec un nouveau mot de passe. Leur mot de passe actuel sera invalidé.',
      confirmLabel: 'Réinitialiser tous les mots de passe',
      danger: true,
      requireTyping: 'CONFIRMER',
      warning: 'Attention — cette action est irréversible.',
    });
    if (!ok) return;
    setBulkResetting(true);
    setBulkResetResult(null);
    const count = await resetAllMembersPasswords();
    setBulkResetResult(count);
    setBulkResetting(false);
    if (count !== null && count > 0) {
      toast.success(`${count} choriste${count > 1 ? 's' : ''} ont reçu leur nouveau mot de passe`);
    } else if (count === 0) {
      toast.success('Aucun compte confirmé à réinitialiser');
    } else {
      toast.error('Erreur lors de la réinitialisation des mots de passe');
    }
  }

  return (
    <div className="border border-red-200 dark:border-red-800 rounded-2xl p-5 flex flex-col gap-3">
      <p className="text-xs font-medium text-red-500 dark:text-red-400 uppercase tracking-wide">
        Zone dangereuse
      </p>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Réinitialiser tous les mots de passe
          </p>
          <p className="text-xs text-foreground/40 mt-0.5">
            Génère un nouveau mot de passe pour chaque choriste confirmé et le leur envoie par
            email.
          </p>
        </div>
        <button
          onClick={handleBulkPasswordResetClick}
          disabled={bulkResetting}
          className="shrink-0 px-4 py-2 rounded-lg text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40"
        >
          {bulkResetting ? 'Envoi en cours...' : 'Réinitialiser'}
        </button>
      </div>
      {bulkResetResult !== null && (
        <p className="text-xs text-primary">
          ✓ {bulkResetResult} choriste{bulkResetResult > 1 ? 's' : ''} ont reçu leur nouveau mot de
          passe.
        </p>
      )}
    </div>
  );
}
