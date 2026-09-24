'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';

import { saveProfile } from './actions';
import { geocodeAddress } from './clientQueries';
import { GdprExportButton } from './GdprExportButton';
import { GeoValidationPopupWrapper } from './GeoValidationPopupWrapper';
import { MfaSection } from './MfaSection';
import { ProfileAddressSection } from './ProfileAddressSection';
import type { ProfileFormValues } from './profileForm';
import { detectProfileChanges, FIELD_LABELS, initialProfileValues } from './profileForm';
import { ProfileIdentitySection } from './ProfileIdentitySection';
import { ProfilePhotoSection } from './ProfilePhotoSection';
import { ProfileVisibilitySections } from './ProfileVisibilitySections';
import type { Coords, MemberProfile } from './types';

type Props = {
  member: MemberProfile;
};

export function ProfilClient({ member }: Props) {
  const [values, setValues] = useState<ProfileFormValues>(() => initialProfileValues(member));
  const [saving, setSaving] = useState(false);
  const [changedFields, setChangedFields] = useState<string[]>([]);
  const [hasCoordChanges, setHasCoordChanges] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<Coords | null>(null);
  const [confirmedCoords, setConfirmedCoords] = useState<Coords | null>(
    member.lat && member.lng ? { lat: member.lat, lng: member.lng } : null,
  );
  const [showGeoPopup, setShowGeoPopup] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const { address, zipCode, city } = values;
  const changes = detectProfileChanges(values, member, hasCoordChanges);
  const addressChanged = changes.some((c) => ['address', 'zip_code', 'city'].includes(c));
  const hasAddress = !!(address || zipCode || city);
  const hasChanges = changes.length > 0;
  const geoStatus = confirmedCoords ? 'confirmed' : member.lat ? 'existing' : 'none';

  function updateValues(patch: Partial<ProfileFormValues>) {
    setValues((prev) => ({ ...prev, ...patch }));
  }

  async function handleGeocode() {
    if (!hasAddress) return;
    if (confirmedCoords !== null) {
      setPendingCoords(confirmedCoords);
      setShowGeoPopup(true);
      return;
    }
    setGeocoding(true);
    const coords = await geocodeAddress(address, zipCode, city);
    setGeocoding(false);
    if (coords) {
      setPendingCoords(coords);
      setShowGeoPopup(true);
    } else {
      toast.error('Adresse introuvable', {
        description: 'Vérifiez la rue, le code postal et la ville, puis réessayez.',
      });
    }
  }

  function handleGeoConfirm(coords: Coords) {
    setConfirmedCoords(coords);
    setHasCoordChanges(true);
    setPendingCoords(null);
    setShowGeoPopup(false);
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setSaving(true);
    setChangedFields([]);

    // Coords : confirmées par l'utilisateur, réinitialisées si adresse changée (le serveur géocode),
    // ou conservées si l'adresse n'a pas changé.
    let lat: number | null;
    let lng: number | null;

    if (confirmedCoords) {
      lat = confirmedCoords.lat;
      lng = confirmedCoords.lng;
    } else if (!hasAddress || addressChanged) {
      lat = null; // le serveur géocodera si l'adresse a changé
      lng = null;
    } else {
      lat = member.lat ?? null;
      lng = member.lng ?? null;
    }

    const ok = await saveProfile(member.id, {
      first_name: values.firstName || null,
      last_name: values.lastName || null,
      phone: values.phone ? values.phone.replace(/\s/g, '') : null,
      address: address || null,
      zip_code: zipCode || null,
      city: city || null,
      birthday: values.birthday || null,
      lat,
      lng,
      visibility_email: values.visibilityEmail,
      visibility_phone: values.visibilityPhone,
      visibility_address: values.visibilityAddress,
      visibility_birthday: values.visibilityBirthday,
    });

    if (ok) {
      setChangedFields(changes);
      setHasCoordChanges(false);
      toast.success('Profil mis à jour', {
        description: changes.map((f) => FIELD_LABELS[f]).join(', '),
      });
    } else {
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Vérifiez votre connexion et réessayez.',
      });
    }
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-8">
      {showGeoPopup && pendingCoords && (
        <GeoValidationPopupWrapper
          coords={pendingCoords}
          address={[address, zipCode, city].filter(Boolean).join(', ')}
          onConfirmAction={handleGeoConfirm}
          onCloseAction={() => {
            setShowGeoPopup(false);
            setPendingCoords(null);
          }}
        />
      )}

      <ProfilePhotoSection
        memberId={member.id}
        initialPhotoUrl={member.photo_url ?? ''}
        alt={`${values.firstName} ${values.lastName}`}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <ProfileIdentitySection member={member} values={values} onChangeAction={updateValues} />

        <ProfileAddressSection
          values={values}
          onAddressChangeAction={(patch) => {
            updateValues(patch);
            setConfirmedCoords(null);
          }}
          geoStatus={geoStatus}
          geocoding={geocoding}
          onGeocodeAction={handleGeocode}
        />

        <ProfileVisibilitySections values={values} onChangeAction={updateValues} />

        {changedFields.length > 0 && (
          <div className="text-sm bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex flex-col gap-1">
            <p className="font-medium text-primary">Profil mis à jour ✓</p>
            <p className="text-xs text-primary/70">
              Champs modifiés : {changedFields.map((f) => FIELD_LABELS[f]).join(', ')}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          {hasChanges && changedFields.length === 0 && (
            <p className="text-xs text-foreground/40">
              {changes.length} modification{changes.length > 1 ? 's' : ''} non sauvegardée
              {changes.length > 1 ? 's' : ''}
            </p>
          )}
          <div className="ml-auto">
            <Button type="submit" disabled={saving || !hasChanges} loading={saving}>
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </form>

      {/* 2FA */}
      <MfaSection isAdmin={member.role === 'admin' || member.role === 'super_admin'} />

      {/* RGPD */}
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
        <div>
          <h2 className="text-sm font-medium text-foreground">Mes données personnelles</h2>
          <p className="text-xs text-foreground/60 mt-0.5">
            Conformément au RGPD, vous pouvez télécharger une copie de toutes vos données
            personnelles stockées sur cette plateforme : profil, saisons, réponses aux sondages et
            journal d&apos;activité.
          </p>
        </div>
        <GdprExportButton />
      </div>
    </div>
  );
}
