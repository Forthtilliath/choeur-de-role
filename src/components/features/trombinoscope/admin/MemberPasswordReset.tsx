'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { resetMemberPassword } from '../clientQueries';

export function MemberPasswordReset({ memberId }: { memberId: string }) {
  const [passwordResetting, setPasswordResetting] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  async function handlePasswordReset() {
    setPasswordResetting(true);
    setPasswordResetSuccess(false);
    const ok = await resetMemberPassword(memberId);
    if (ok) {
      setPasswordResetSuccess(true);
      toast.success('Nouveau mot de passe envoyé par email');
    } else {
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
    setPasswordResetting(false);
  }

  return (
    <div className="border-t border-border pt-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground/50">Mot de passe</p>
          <p className="text-xs text-foreground/30">
            Génère un nouveau mot de passe et l&apos;envoie par email
          </p>
        </div>
        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={passwordResetting}
          className="text-xs px-3 py-2 rounded-lg border border-amber-300 text-amber-600 hover:bg-amber-50 disabled:opacity-50 shrink-0"
        >
          {passwordResetting ? '...' : 'Réinitialiser le mot de passe'}
        </button>
      </div>
      {passwordResetSuccess && (
        <p className="text-xs text-primary">✓ Nouveau mot de passe envoyé par email.</p>
      )}
    </div>
  );
}
