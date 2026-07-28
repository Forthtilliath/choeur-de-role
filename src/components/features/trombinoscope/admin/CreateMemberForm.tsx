'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useRole } from '@/hooks/useRole';
import { Tables } from '@/types/database';
import { Season } from '../../concerts';
import { AdminMemberWithSeasons } from '../types';

type VoicePart = Tables<'voice_parts'>;

type Props = {
  voiceParts: VoicePart[];
  seasons: Season[];
  onCloseAction: () => void;
  onSuccessAction: (member: AdminMemberWithSeasons) => void;
};

const ROLES = [
  { value: 'member', label: 'Choriste' },
  { value: 'ca', label: 'CA' },
  { value: 'admin', label: 'Admin' },
] as const;

export function CreateMemberForm({
  voiceParts,
  seasons,
  onCloseAction,
  onSuccessAction,
}: Props) {
  const { role: currentUserRole } = useRole();
  const isSuperAdmin = currentUserRole === 'super_admin';

  const activeSeasons = seasons
    .filter((s) => s.active)
    .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());

  const defaultSeasonIds = activeSeasons.length >= 1 ? [activeSeasons[0].id] : [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voicePartId, setVoicePartId] = useState('');
  const [seasonIds, setSeasonIds] = useState<string[]>(defaultSeasonIds);
  const [memberRole, setMemberRole] = useState<string>('member');
  const [skipEmail, setSkipEmail] = useState(false);
  const [createdPassphrase, setCreatedPassphrase] = useState<string | null>(null);
  const [createdMember, setCreatedMember] = useState<AdminMemberWithSeasons | null>(null);

  function toggleSeason(id: string) {
    setSeasonIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!voicePartId) {
      setError('Veuillez sélectionner un pupitre.');
      return;
    }
    if (seasonIds.length === 0) {
      setError('Veuillez sélectionner au moins une saison.');
      return;
    }

    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const data: Record<string, unknown> = {
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      first_name: (form.elements.namedItem('first_name') as HTMLInputElement).value,
      last_name: (form.elements.namedItem('last_name') as HTMLInputElement).value,
      voice_part_id: voicePartId,
      season_ids: seasonIds,
    };

    if (isSuperAdmin) {
      data.role = memberRole;
      data.skip_email = skipEmail;
    }

    const res = await fetch('/api/admin/create-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.error ?? 'Une erreur est survenue');
      setLoading(false);
    } else if (result.passphrase) {
      // Mode sans email : afficher la passphrase avant de fermer
      setCreatedPassphrase(result.passphrase);
      setCreatedMember(result.member);
      toast.success('Compte créé sans envoi d\'email');
    } else {
      onSuccessAction(result.member);
      toast.success('Compte créé — email d\'invitation envoyé');
    }
  }

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-sm border transition-all ${
      active ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60'
    }`;

  // Écran de succès avec passphrase (mode sans email)
  if (createdPassphrase && createdMember) {
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
          <label className="text-xs font-medium text-foreground/50 uppercase tracking-wide">
            Passphrase de connexion
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-base font-semibold bg-background border border-primary/30 text-primary rounded-lg px-4 py-3 select-all">
              {createdPassphrase}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(createdPassphrase)}
              className="px-3 py-3 text-xs border border-border rounded-lg hover:bg-muted transition-colors text-foreground/60 hover:text-foreground shrink-0"
              title="Copier"
            >
              Copier
            </button>
          </div>
          <p className="text-xs text-foreground/40">
            Email :{' '}
            <span className="font-mono">{(createdMember as unknown as { email: string }).email}</span>
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => onSuccessAction(createdMember)}>Fermer</Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 border border-border rounded-2xl p-6 bg-background-secondary"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">Créer un compte</h2>
        <button
          type="button"
          onClick={onCloseAction}
          className="text-foreground/40 hover:text-foreground text-lg"
        >
          ✕
        </button>
      </div>

      {error && <p className="text-red-500 dark:text-red-300 text-sm p-3 bg-red-50 dark:bg-red-950/40 rounded-lg">{error}</p>}

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-foreground/50">Prénom *</label>
          <input
            name="first_name"
            type="text"
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background text-foreground"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-foreground/50">Nom *</label>
          <input
            name="last_name"
            type="text"
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background text-foreground"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-foreground/50">Email *</label>
        <input
          name="email"
          type="email"
          required
          className="border border-border rounded-lg px-4 py-2 text-sm bg-background text-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-foreground/50">Pupitre *</label>
        <div className="flex flex-wrap gap-2">
          {voiceParts.map((vp) => (
            <button
              key={vp.id}
              type="button"
              onClick={() => setVoicePartId(vp.id)}
              className={pillClass(voicePartId === vp.id)}
            >
              {vp.name.charAt(0).toUpperCase() + vp.name.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-foreground/50">Saison *</label>
        {activeSeasons.length === 0 ? (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Aucune saison active. Activez une saison dans l&apos;administration des saisons.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeSeasons.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSeason(s.id)}
                className={pillClass(seasonIds.includes(s.id))}
              >
                {seasonIds.includes(s.id) ? '✓ ' : ''}
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Options super_admin */}
      {isSuperAdmin && (
        <div className="flex flex-col gap-3 pt-1 border-t border-border">
          <p className="text-xs text-foreground/40 uppercase tracking-wide font-medium">
            Options super admin
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-foreground/50">Rôle</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setMemberRole(r.value)}
                  className={pillClass(memberRole === r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={skipEmail}
              onChange={(e) => setSkipEmail(e.target.checked)}
              className="w-4 h-4 accent-primary rounded"
            />
            <span className="text-sm text-foreground/70">
              Créer sans envoi d&apos;email{' '}
              <span className="text-foreground/40 text-xs">(affiche la passphrase à la création)</span>
            </span>
          </label>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCloseAction}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading} loading={loading}>
          {loading ? 'Création en cours...' : 'Créer le compte'}
        </Button>
      </div>
    </form>
  );
}
