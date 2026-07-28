'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { formatPhone } from '@/utils/phoneHelpers';
import { GeoValidationPopupWrapper } from './GeoValidationPopupWrapper';
import { saveProfile } from './actions';
import { geocodeAddress, uploadProfilePhoto } from './clientQueries';
import { useImagePreview } from '@/hooks/useImagePreview';
import { BirthdayVisibility, Coords, MemberProfile } from './types';
import { GdprExportButton } from './GdprExportButton';
import { MfaSection } from './MfaSection';

type Props = {
  member: MemberProfile;
};

function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full gap-4 py-2"
    >
      <div className="text-left">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-xs text-foreground/40">{description}</p>
      </div>
      <div
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-foreground/20'}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </div>
    </button>
  );
}

const FIELD_LABELS: Record<string, string> = {
  first_name: 'Prénom',
  last_name: 'Nom',
  phone: 'Téléphone',
  address: 'Adresse',
  zip_code: 'Code postal',
  city: 'Ville',
  birthday: 'Date de naissance',
  visibility_email: 'Visibilité email',
  visibility_phone: 'Visibilité téléphone',
  visibility_address: 'Visibilité adresse',
  coordinates: 'Coordonnées géographiques',
};

export function ProfilClient({ member }: Props) {
  const [firstName, setFirstName] = useState(member.first_name ?? '');
  const [lastName, setLastName] = useState(member.last_name ?? '');
  const [phone, setPhone] = useState(
    member.phone ? formatPhone(member.phone.replace(/\D/g, '')) : '',
  );
  const [address, setAddress] = useState(member.address ?? '');
  const [zipCode, setZipCode] = useState(member.zip_code ?? '');
  const [city, setCity] = useState(member.city ?? '');
  const [birthday, setBirthday] = useState(member.birthday ? member.birthday.slice(0, 10) : '');
  const [visibilityEmail, setVisibilityEmail] = useState(member.visibility_email ?? false);
  const [visibilityPhone, setVisibilityPhone] = useState(member.visibility_phone ?? false);
  const [visibilityAddress, setVisibilityAddress] = useState(member.visibility_address ?? false);
  const [visibilityBirthday, setVisibilityBirthday] = useState<BirthdayVisibility>(
    (member.visibility_birthday as BirthdayVisibility) ?? 'none',
  );
  const [photoUrl, setPhotoUrl] = useState(member.photo_url ?? '');
  const [saving, setSaving] = useState(false);
  const [changedFields, setChangedFields] = useState<string[]>([]);
  const [hasCoordChanges, setHasCoordChanges] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<Coords | null>(null);
  const [confirmedCoords, setConfirmedCoords] = useState<Coords | null>(
    member.lat && member.lng ? { lat: member.lat, lng: member.lng } : null,
  );
  const [showGeoPopup, setShowGeoPopup] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const {
    previewUrl: photoPreviewUrl,
    isPending: photoIsPending,
    uploading: photoUploading,
    handleSelect: handlePhotoSelect,
    confirm: confirmPhoto,
    cancel: cancelPhoto,
  } = useImagePreview(async (file) => {
    const url = await uploadProfilePhoto(member.id, file);
    if (!url) {
      toast.error("Erreur lors de l'upload de la photo");
      throw new Error('Upload failed');
    }
    setPhotoUrl(url);
    toast.success('Photo de profil mise à jour');
  });

  function detectChanges(): string[] {
    const changes: string[] = [];
    if (firstName !== (member.first_name ?? '')) changes.push('first_name');
    if (lastName !== (member.last_name ?? '')) changes.push('last_name');
    if (phone.replace(/\s/g, '') !== (member.phone ?? '')) changes.push('phone');
    if (address !== (member.address ?? '')) changes.push('address');
    if (zipCode !== (member.zip_code ?? '')) changes.push('zip_code');
    if (city !== (member.city ?? '')) changes.push('city');
    if (birthday !== (member.birthday?.slice(0, 10) ?? '')) changes.push('birthday');
    if (visibilityEmail !== (member.visibility_email ?? false)) changes.push('visibility_email');
    if (visibilityPhone !== (member.visibility_phone ?? false)) changes.push('visibility_phone');
    if (visibilityAddress !== (member.visibility_address ?? false))
      changes.push('visibility_address');
    if (visibilityBirthday !== (member.visibility_birthday ?? 'none'))
      changes.push('visibility_birthday');
    if (hasCoordChanges) changes.push('coordinates');
    return changes;
  }

  const addressChanged = detectChanges().some((c) => ['address', 'zip_code', 'city'].includes(c));
  const hasAddress = !!(address || zipCode || city);
  const hasChanges = detectChanges().length > 0;
  const geoStatus = confirmedCoords ? 'confirmed' : member.lat ? 'existing' : 'none';

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

    const changes = detectChanges();

    // Coords : confirmées par l'utilisateur, réinitialisées si adresse changée (le serveur géocode),
    // ou conservées si l'adresse n'a pas changé.
    let lat: number | null;
    let lng: number | null;

    if (confirmedCoords) {
      lat = confirmedCoords.lat;
      lng = confirmedCoords.lng;
    } else if (!hasAddress) {
      lat = null;
      lng = null;
    } else if (addressChanged) {
      lat = null; // le serveur géocodera
      lng = null;
    } else {
      lat = member.lat ?? null;
      lng = member.lng ?? null;
    }

    const ok = await saveProfile(member.id, {
      first_name: firstName || null,
      last_name: lastName || null,
      phone: phone ? phone.replace(/\s/g, '') : null,
      address: address || null,
      zip_code: zipCode || null,
      city: city || null,
      birthday: birthday || null,
      lat,
      lng,
      visibility_email: visibilityEmail,
      visibility_phone: visibilityPhone,
      visibility_address: visibilityAddress,
      visibility_birthday: visibilityBirthday,
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

      {/* Photo */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-background-secondary shrink-0">
          {(photoPreviewUrl ?? photoUrl) ? (
            <Image
              src={photoPreviewUrl ?? photoUrl}
              alt={`${firstName} ${lastName}`}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-foreground/30">
              👤
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Photo de profil</p>
          <p className="text-xs text-foreground/50">JPG, PNG — recommandé : format carré</p>
          {photoIsPending ? (
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                disabled={photoUploading}
                onClick={confirmPhoto}
              >
                {photoUploading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Upload...
                  </span>
                ) : '✓ Valider'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={photoUploading}
                onClick={cancelPhoto}
              >
                Annuler
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => photoInputRef.current?.click()}
            >
              {photoUrl ? '📷 Changer la photo' : '📷 Ajouter une photo'}
            </Button>
          )}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Identité */}
        <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
          <h2 className="text-sm font-medium text-foreground">Identité</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Prénom</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
                placeholder="Marie"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Nom</label>
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
              <label className="text-xs text-foreground/50">Date de naissance</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Pupitre</label>
              <p className="text-sm text-foreground/60 px-4 py-2 border border-border rounded-lg bg-background-secondary">
                {member.voice_parts?.name ?? 'Non défini'}
              </p>
              <p className="text-xs text-foreground/30">
                Le pupitre est géré par un administrateur.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
          <h2 className="text-sm font-medium text-foreground">Contact</h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/50">Email</label>
            <p className="text-sm text-foreground/60 px-4 py-2 border border-border rounded-lg bg-background-secondary">
              {member.email ?? 'Non défini'}
            </p>
            <p className="text-xs text-foreground/30">
              L&apos;email est géré par un administrateur.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/50">Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              type="tel"
              inputMode="numeric"
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="06 12 34 56 78"
              maxLength={14}
            />
          </div>
        </div>

        {/* Adresse */}
        <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
          <h2 className="text-sm font-medium text-foreground">Adresse</h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground/50">Rue</label>
            <input
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setConfirmedCoords(null);
              }}
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="12 rue de la Paix"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Code postal</label>
              <input
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value);
                  setConfirmedCoords(null);
                }}
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
                placeholder="49000"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs text-foreground/50">Ville</label>
              <input
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setConfirmedCoords(null);
                }}
                className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
                placeholder="Angers"
              />
            </div>
          </div>

          {hasAddress && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
              <div className="flex items-center justify-between gap-3">
                <div>
                  {geoStatus === 'confirmed' ? (
                    <p className="text-xs text-primary">✓ Position confirmée sur la carte</p>
                  ) : geoStatus === 'existing' ? (
                    <p className="text-xs text-foreground/50">
                      📍 Position existante — vérifiez si l&apos;adresse a changé
                    </p>
                  ) : (
                    <p className="text-xs text-foreground/40">
                      📍 Aucune position — géocodez pour apparaître sur la carte
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGeocode}
                  disabled={geocoding}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    geoStatus === 'confirmed'
                      ? 'border-primary/30 text-primary hover:bg-primary/10'
                      : 'border-border text-foreground/60 hover:border-primary hover:text-primary'
                  } disabled:opacity-50`}
                >
                  {geocoding ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Localisation...
                    </>
                  ) : geoStatus === 'confirmed' ? (
                    '📍 Modifier la position'
                  ) : (
                    '📍 Vérifier la position'
                  )}
                </button>
              </div>
              {!visibilityAddress && (
                <p className="text-xs text-foreground/40">
                  Votre adresse reste masquée des choristes, mais le CA peut voir votre position.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Visibilité */}
        <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
          <div>
            <h2 className="text-sm font-medium text-foreground">Visibilité sur le trombinoscope</h2>
            <p className="text-xs text-foreground/40 mt-0.5">
              Choisissez ce que les autres choristes peuvent voir de vous.
            </p>
          </div>
          <div className="flex flex-col divide-y divide-border">
            <div className="pb-3">
              <Switch
                checked={visibilityEmail}
                onChange={setVisibilityEmail}
                label="Adresse email"
                description={visibilityEmail ? 'Visible par les autres choristes' : 'Masquée'}
              />
            </div>
            <div className="py-3">
              <Switch
                checked={visibilityPhone}
                onChange={setVisibilityPhone}
                label="Numéro de téléphone"
                description={visibilityPhone ? 'Visible par les autres choristes' : 'Masqué'}
              />
            </div>
            <div className="pt-3">
              <Switch
                checked={visibilityAddress}
                onChange={setVisibilityAddress}
                label="Adresse postale + carte"
                description={
                  visibilityAddress
                    ? 'Visible sur le trombinoscope et la carte'
                    : 'Masquée des choristes — le CA peut voir votre position sur la carte'
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
          <div>
            <h2 className="text-sm font-medium text-foreground">Visibilité sur le calendrier</h2>
            <p className="text-xs text-foreground/40 mt-0.5">
              Choisissez ce que les autres choristes peuvent voir de vous.
            </p>
          </div>
          <div className="flex flex-col divide-y divide-border">
            <div className="pb-3">
              <p className="text-xs font-medium text-foreground">Anniversaire</p>
              <p className="text-xs text-foreground/40">
                Partagez votre anniversaire sur le calendrier.
              </p>
              <div className="flex gap-2 mt-2">
                {(
                  [
                    { value: 'none', label: 'Ne pas partager' },
                    { value: 'date_only', label: 'Date uniquement' },
                    { value: 'date_and_age', label: 'Date et âge' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVisibilityBirthday(opt.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      visibilityBirthday === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-foreground/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {visibilityBirthday !== 'none' && !birthday && (
                <p className="text-xs text-orange-500">
                  ⚠️ Renseignez votre date de naissance pour activer le partage.
                </p>
              )}
            </div>
          </div>
        </div>

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
              {detectChanges().length} modification{detectChanges().length > 1 ? 's' : ''} non
              sauvegardée{detectChanges().length > 1 ? 's' : ''}
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
