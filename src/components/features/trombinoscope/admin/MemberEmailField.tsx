'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { updateMemberEmail } from '../clientQueries';

type Props = {
  memberId: string;
  initialEmail: string;
};

// Email d'un membre existant : affiché en lecture, modifiable via un mini-formulaire
export function MemberEmailField({ memberId, initialEmail }: Props) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(initialEmail);

  async function handleEmailChange() {
    if (!newEmail) return;
    setEmailSaving(true);
    const ok = await updateMemberEmail(memberId, newEmail);
    if (ok) {
      setCurrentEmail(newEmail);
      setEmailSuccess(true);
      setShowEmailForm(false);
      setNewEmail('');
      toast.success('Email mis à jour');
    } else {
      toast.error("Erreur lors de la mise à jour de l'email");
    }
    setEmailSaving(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="flex-1 min-w-0 truncate text-sm text-foreground/60 px-4 py-2 border border-border rounded-lg bg-background-secondary">
          {currentEmail}
        </p>
        <button
          type="button"
          onClick={() => setShowEmailForm((v) => !v)}
          className="text-xs text-primary px-3 py-2 rounded-lg border border-border hover:border-primary transition-colors"
        >
          {showEmailForm ? 'Annuler' : 'Modifier'}
        </button>
      </div>
      {showEmailForm && (
        <div className="flex gap-2">
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            type="email"
            placeholder="nouvel@email.com"
            className="flex-1 border border-border rounded-lg px-4 py-2 text-sm bg-background"
          />
          <button
            type="button"
            onClick={handleEmailChange}
            disabled={emailSaving || !newEmail}
            className="text-xs px-3 py-2 rounded-lg bg-primary text-white disabled:opacity-50"
          >
            {emailSaving ? '...' : 'Confirmer'}
          </button>
        </div>
      )}
      {emailSuccess && (
        <p className="text-xs text-primary">
          ✓ Email mis à jour — un email de confirmation a été envoyé à {currentEmail}.
        </p>
      )}
    </div>
  );
}
