import { Button } from '@/components/ui/Button';

import type { AdminMemberWithSeasons } from '../types';

type Props = {
  passphrase: string;
  member: AdminMemberWithSeasons;
  onCloseAction: () => void;
};

// Écran de succès avec passphrase (création sans envoi d'email)
export function CreatedMemberPassphrase({ passphrase, member, onCloseAction }: Props) {
  return (
    <div className="flex flex-col gap-4 border border-border rounded-2xl p-6 bg-background-secondary">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">Compte créé</h2>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm text-foreground/70">
          Le compte a été créé sans envoi d&apos;email. Notez la passphrase ci-dessous — elle ne
          sera plus accessible ensuite.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-foreground/50 uppercase tracking-wide">
          Passphrase de connexion
        </span>
        <div className="flex items-center gap-2">
          <code className="flex-1 font-mono text-base font-semibold bg-background border border-primary/30 text-primary rounded-lg px-4 py-3 select-all">
            {passphrase}
          </code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(passphrase)}
            className="px-3 py-3 text-xs border border-border rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground shrink-0"
            title="Copier"
          >
            Copier
          </button>
        </div>
        <p className="text-xs text-foreground/40">
          Email :{' '}
          <span className="font-mono">{(member as unknown as { email: string }).email}</span>
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={onCloseAction}>Fermer</Button>
      </div>
    </div>
  );
}
