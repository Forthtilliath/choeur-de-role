'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { Season } from '@/components/features/concerts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { formatPhone } from '@/utils/phoneHelpers';
import { useImagePreview } from '@/hooks/useImagePreview';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';
import { saveMemberAdminAction, getMemberAuditHistory } from './actions';
import type { MemberHistoryEntry } from '../queries';
import {
  addMemberSeason,
  removeMemberSeason,
  resetMemberPassword,
  updateMemberEmail,
} from '../clientQueries';
import { AdminMemberWithSeasons, ROLE_LABELS, VoicePart } from '../types';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';

const ROLE_RANK: Record<string, number> = { member: 0, ca: 1, admin: 2, super_admin: 3 };

type Props = {
  member: AdminMemberWithSeasons | null;
  voiceParts: VoicePart[];
  currentUserRole: string;
  seasons: Season[];
  isEmailConfirmed?: boolean;
  onCloseAction: () => void;
  onSaveAction: (member: AdminMemberWithSeasons) => void;
  onPhotoUpdateAction?: (memberId: string, photoUrl: string) => void;
};

export function MemberForm({
  member,
  voiceParts,
  currentUserRole,
  seasons,
  isEmailConfirmed,
  onCloseAction,
  onSaveAction,
  onPhotoUpdateAction,
}: Props) {
  const [firstName, setFirstName] = useState(member?.first_name ?? '');
  const [lastName, setLastName] = useState(member?.last_name ?? '');
  const [email, setEmail] = useState(member?.email ?? '');
  const [phone, setPhone] = useState(
    member?.phone ? formatPhone(member.phone.replace(/\D/g, '')) : '',
  );
  const [birthday, setBirthday] = useState(member?.birthday?.slice(0, 10) ?? '');
  const [address, setAddress] = useState(member?.address ?? '');
  const [zipCode, setZipCode] = useState(member?.zip_code ?? '');
  const [city, setCity] = useState(member?.city ?? '');
  const [voicePartId, setVoicePartId] = useState(member?.voice_part_id ?? '');
  const [role, setRole] = useState(member?.role ?? 'member');
  const [bureauRole, setBureauRole] = useState(member?.bureau_role ?? '');
  const [memberSeasons, setMemberSeasons] = useState<string[]>(
    member?.member_season
      .filter((ms): ms is { season_id: string } => !!ms.season_id)
      .map((ms) => ms.season_id) ?? [],
  );

  const [photoUrl, setPhotoUrl] = useState(member?.photo_url ?? '');
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
    if (!member) return;
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
      toast.error("Erreur lors de la mise à jour de la photo");
      throw new Error('DB update failed');
    }
    setPhotoUrl(url);
    setPhotoSuccess(true);
    setTimeout(() => setPhotoSuccess(false), 3000);
    onPhotoUpdateAction?.(member.id, url);
    toast.success('Photo mise à jour');
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<MemberHistoryEntry[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const formRef = useFormShortcuts(onCloseAction);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(member?.email ?? '');
  const [passwordResetting, setPasswordResetting] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const canEditRole = member
    ? ROLE_RANK[currentUserRole] > ROLE_RANK[member.role ?? 'member']
    : false;

  const availableRoles = Object.keys(ROLE_RANK).filter(
    (r) => ROLE_RANK[r] < ROLE_RANK[currentUserRole],
  );

  async function handleEmailChange() {
    if (!member || !newEmail) return;
    setEmailSaving(true);
    const ok = await updateMemberEmail(member.id, newEmail);
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

  async function handlePasswordReset() {
    if (!member) return;
    setPasswordResetting(true);
    setPasswordResetSuccess(false);
    const ok = await resetMemberPassword(member.id);
    if (ok) {
      setPasswordResetSuccess(true);
      toast.success('Nouveau mot de passe envoyé par email');
    } else {
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
    setPasswordResetting(false);
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!member) return; // création gérée par CreateMemberForm
    setSaving(true);
    setError('');

    const saved = await saveMemberAdminAction(member.id, {
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone ? phone.replace(/\s/g, '') : null,
      birthday: birthday || null,
      address: address || null,
      zip_code: zipCode || null,
      city: city || null,
      voice_part_id: voicePartId || null,
      role,
      bureau_role: bureauRole || null,
    });

    if (saved) {
      onSaveAction({ ...saved, member_season: memberSeasons.map((id) => ({ season_id: id })) });
      toast.success('Membre mis à jour');
    } else {
      setError('Erreur lors de la sauvegarde.');
    }
    setSaving(false);
  }

  async function handleToggleSeason(seasonId: string) {
    if (!member) return; // pour création, géré séparément
    if (memberSeasons.includes(seasonId)) {
      const ok = await removeMemberSeason(member.id, seasonId);
      if (ok) setMemberSeasons((prev) => prev.filter((id) => id !== seasonId));
      else toast.error('Erreur lors de la mise à jour de la saison');
    } else {
      const ok = await addMemberSeason(member.id, seasonId);
      if (ok) setMemberSeasons((prev) => [...prev, seasonId]);
      else toast.error('Erreur lors de la mise à jour de la saison');
    }
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-medium text-foreground">
          {member ? `Modifier — ${member.first_name} ${member.last_name}` : 'Nouveau membre'}
        </h2>
        <button
          onClick={onCloseAction}
          className="text-foreground/40 hover:text-foreground text-lg"
        >
          ✕
        </button>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {member && (
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
                <div className="w-full h-full flex items-center justify-center text-foreground/30 text-2xl">👤</div>
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
                    ) : 'Confirmer'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" disabled={photoUploading} onClick={cancelPhoto}>
                    Annuler
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" onClick={() => photoInputRef.current?.click()}>
                  {photoUrl ? '📷 Changer la photo' : '📷 Ajouter une photo'}
                </Button>
              )}
              {photoSuccess && (
                <p className="text-xs text-primary">✓ Photo enregistrée</p>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/50">Prénom *</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Marie"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/50">Nom</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Dupont"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/50">Email</label>
            {member ? (
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
            ) : (
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
                placeholder="marie@email.com"
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/50">Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              type="tel"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="06 12 34 56 78"
              maxLength={14}
            />
          </div>
        </div>

        {member && isEmailConfirmed && (
          <div className="border-t border-border pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground/50">Mot de passe</p>
                <p className="text-xs text-foreground/30">Génère un nouveau mot de passe et l&apos;envoie par email</p>
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
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/50">Date de naissance</label>
            <input
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              type="date"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-foreground/50">Pupitre</label>
            <Select
              value={voicePartId}
              onChange={(e) => setVoicePartId(e.target.value)}
              className="px-4"
            >
              <option value="">Non défini</option>
              {voiceParts.map((vp) => (
                <option key={vp.id} value={vp.id}>
                  {vp.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-xs font-medium text-foreground/50">Adresse</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="12 rue de la Paix"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="49000"
              maxLength={5}
              inputMode="numeric"
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background col-span-2"
              placeholder="Angers"
            />
          </div>
        </div>

        {member && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground/50">Rôle</label>
              {canEditRole ? (
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-4"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>
              ) : (
                <p className="text-sm text-foreground/60 px-4 py-2 border border-border rounded-lg bg-background-secondary">
                  {ROLE_LABELS[member.role ?? 'member']}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground/50">Rôle bureau</label>
              <input
                value={bureauRole}
                onChange={(e) => setBureauRole(e.target.value)}
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
                placeholder="Président"
              />
            </div>
          </div>
        )}

        {member && (() => {
          const activeSeasons = seasons
            .filter((s) => s.active)
            .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());
          if (activeSeasons.length === 0) return null;
          return (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground/50">Saisons</label>
              <div className="flex flex-wrap gap-2">
                {activeSeasons.map((s) => {
                  const assigned = memberSeasons.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleToggleSeason(s.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        assigned
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground/60'
                      }`}
                    >
                      {assigned ? '✓ ' : ''}
                      {s.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-foreground/30">
                Modifié immédiatement — pas besoin d&apos;enregistrer.
              </p>
            </div>
          );
        })()}

        {error && (
          <p className="text-sm text-red-500 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onCloseAction}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde...' : 'Modifier'}
          </Button>
        </div>
      </form>

      {member && (
        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            onClick={async () => {
              if (!historyOpen && history === null) {
                setHistoryLoading(true);
                const logs = await getMemberAuditHistory(member.id);
                setHistory(logs);
                setHistoryLoading(false);
              }
              setHistoryOpen((v) => !v);
            }}
            className="flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground transition-colors"
          >
            <span>{historyOpen ? '▲' : '▼'}</span>
            Historique des modifications
          </button>

          {historyOpen && (
            <div className="mt-3 flex flex-col gap-2">
              {historyLoading && <p className="text-xs text-foreground/40">Chargement…</p>}
              {!historyLoading && history?.length === 0 && (
                <p className="text-xs text-foreground/40">Aucune modification enregistrée.</p>
              )}
              {!historyLoading && history?.map((entry) => (
                <div key={entry.id} className="border border-border rounded-lg px-3 py-2 bg-background text-xs flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground/70">{ACTION_HISTORY_LABELS[entry.action] ?? entry.action}</span>
                    <span className="text-foreground/30 shrink-0">{formatHistoryDate(entry.created_at)}</span>
                  </div>
                  {entry.actor_name && (
                    <span className="text-foreground/40">par {entry.actor_name}</span>
                  )}
                  {!!entry.details?.changes && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      {Object.entries(entry.details.changes as Record<string, { from: unknown; to: unknown }>).map(([field, { from, to }]) => (
                        <p key={field} className="text-foreground/50">
                          <span className="font-medium">{FIELD_LABELS[field] ?? field}</span>
                          {' : '}
                          <span className="line-through text-foreground/30">{formatFieldValue(field, from)}</span>
                          {' → '}
                          <span className="text-foreground">{formatFieldValue(field, to)}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatFieldValue(field: string, value: unknown): string {
  if (value == null || value === '') return '—';
  if (field === 'birthday' && typeof value === 'string') {
    const d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return String(value);
}

const ACTION_HISTORY_LABELS: Record<string, string> = {
  member_create: 'Membre créé',
  member_update: 'Membre modifié',
  member_delete: 'Membre supprimé',
  password_reset: 'Mot de passe réinitialisé',
  email_change: 'Email modifié',
  resend_invite: 'Invitation renvoyée',
};

const FIELD_LABELS: Record<string, string> = {
  first_name: 'Prénom',
  last_name: 'Nom',
  phone: 'Téléphone',
  birthday: 'Naissance',
  address: 'Adresse',
  zip_code: 'Code postal',
  city: 'Ville',
  voice_part_id: 'Pupitre',
  role: 'Rôle',
  bureau_role: 'Rôle bureau',
};

function formatHistoryDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}
