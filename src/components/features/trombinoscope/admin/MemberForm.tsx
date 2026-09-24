'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import type { Season } from '@/components/features/concerts';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';
import { formatPhone } from '@/utils/phoneHelpers';

import { addMemberSeason, removeMemberSeason } from '../clientQueries';
import type { AdminMemberWithSeasons, VoicePart } from '../types';

import { saveMemberAdminAction } from './actions';
import { MemberEmailField } from './MemberEmailField';
import { MemberHistory } from './MemberHistory';
import { MemberPasswordReset } from './MemberPasswordReset';
import { MemberPhotoField } from './MemberPhotoField';
import { MemberRoleFields } from './MemberRoleFields';
import { MemberSeasonsField } from './MemberSeasonsField';

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
  const [phone, setPhone] = useState(() =>
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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const formRef = useFormShortcuts(onCloseAction);

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
        {member && <MemberPhotoField member={member} onPhotoUpdateAction={onPhotoUpdateAction} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="member-first-name" className="text-xs font-medium text-foreground/50">
              Prénom *
            </label>
            <input
              id="member-first-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Marie"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="member-last-name" className="text-xs font-medium text-foreground/50">
              Nom
            </label>
            <input
              id="member-last-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Dupont"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-foreground/50">Email</span>
            {member ? (
              <MemberEmailField memberId={member.id} initialEmail={member.email ?? ''} />
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
            <label htmlFor="member-phone" className="text-xs font-medium text-foreground/50">
              Téléphone
            </label>
            <input
              id="member-phone"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              type="tel"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="06 12 34 56 78"
              maxLength={14}
            />
          </div>
        </div>

        {member && isEmailConfirmed && <MemberPasswordReset memberId={member.id} />}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="member-birthday" className="text-xs font-medium text-foreground/50">
              Date de naissance
            </label>
            <input
              id="member-birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              type="date"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="member-voice-part" className="text-xs font-medium text-foreground/50">
              Pupitre
            </label>
            <Select
              id="member-voice-part"
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
          <label htmlFor="member-address" className="text-xs font-medium text-foreground/50">
            Adresse
          </label>
          <input
            id="member-address"
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
          <MemberRoleFields
            memberRole={member.role}
            currentUserRole={currentUserRole}
            role={role}
            onRoleChangeAction={setRole}
            bureauRole={bureauRole}
            onBureauRoleChangeAction={setBureauRole}
          />
        )}

        {member && (
          <MemberSeasonsField
            seasons={seasons}
            memberSeasons={memberSeasons}
            onToggleSeasonAction={handleToggleSeason}
          />
        )}

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

      {member && <MemberHistory memberId={member.id} />}
    </div>
  );
}
