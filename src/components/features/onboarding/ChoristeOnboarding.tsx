'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { formatPhone } from '@/utils/phoneHelpers';
import { uploadProfilePhoto } from '@/components/features/profil/clientQueries';
import { completeOnboarding } from '@/app/choristes/bienvenue/actions';
import { useImagePreview } from '@/hooks/useImagePreview';
import type { BirthdayVisibility } from '@/components/features/profil/types';

type Props = {
  memberId: string;
  firstName: string;
  initialPhone: string;
  initialBirthday: string;
  initialAddress: string;
  initialZipCode: string;
  initialCity: string;
  initialPhotoUrl: string;
  initialVisibilityEmail: boolean;
  initialVisibilityPhone: boolean;
  initialVisibilityAddress: boolean;
  initialVisibilityBirthday: BirthdayVisibility;
};

const TOTAL_STEPS = 5;

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-colors ${
                active
                  ? 'bg-primary border-primary text-white'
                  : done
                    ? 'bg-primary/20 border-primary/30 text-primary'
                    : 'bg-background-secondary border-border text-foreground/30'
              }`}
            >
              {done ? '✓' : step}
            </div>
            {step < TOTAL_STEPS && (
              <div className={`h-px w-8 ${done ? 'bg-primary/40' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
      className="flex items-center justify-between w-full gap-4 py-3"
    >
      <div className="text-left">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-foreground/50">{description}</p>
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

export function ChoristeOnboarding({
  memberId,
  firstName,
  initialPhone,
  initialBirthday,
  initialAddress,
  initialZipCode,
  initialCity,
  initialPhotoUrl,
  initialVisibilityEmail,
  initialVisibilityPhone,
  initialVisibilityAddress,
  initialVisibilityBirthday,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 2 — photo
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const {
    previewUrl: photoPreviewUrl,
    isPending: photoIsPending,
    uploading: photoUploading,
    handleSelect: handlePhotoSelect,
    confirm: confirmPhoto,
    cancel: cancelPhoto,
  } = useImagePreview(async (file) => {
    const url = await uploadProfilePhoto(memberId, file);
    if (!url) {
      toast.error("Erreur lors de l'upload");
      throw new Error('Upload failed');
    }
    setPhotoUrl(url);
    toast.success('Photo enregistrée');
  });

  // Step 3 — infos
  const [phone, setPhone] = useState(initialPhone);
  const [birthday, setBirthday] = useState(initialBirthday);
  const [address, setAddress] = useState(initialAddress);
  const [zipCode, setZipCode] = useState(initialZipCode);
  const [city, setCity] = useState(initialCity);

  // Step 4 — visibility
  const [visibilityEmail, setVisibilityEmail] = useState(initialVisibilityEmail);
  const [visibilityPhone, setVisibilityPhone] = useState(initialVisibilityPhone);
  const [visibilityAddress, setVisibilityAddress] = useState(initialVisibilityAddress);
  const [visibilityBirthday, setVisibilityBirthday] =
    useState<BirthdayVisibility>(initialVisibilityBirthday);

  const [completing, setCompleting] = useState(false);



  async function handleComplete(destination = '/choristes') {
    setCompleting(true);
    const ok = await completeOnboarding({
      phone: phone.replace(/\s/g, '') || null,
      address: address || null,
      zip_code: zipCode || null,
      city: city || null,
      birthday: birthday || null,
      visibility_email: visibilityEmail,
      visibility_phone: visibilityPhone,
      visibility_address: visibilityAddress,
      visibility_birthday: visibilityBirthday,
    });
    if (ok) {
      router.push(destination);
    } else {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setCompleting(false);
    }
  }

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  const inputClass =
    'border border-border rounded-lg px-4 py-2.5 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <StepProgress current={step} />

        {/* Step 1 — Bienvenue */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-primary font-medium uppercase tracking-widest mb-2">
                Bienvenue
              </p>
              <h1 className="text-3xl font-medium text-foreground mb-3">
                Bonjour {firstName}&nbsp;!
              </h1>
              <p className="text-foreground/60 leading-relaxed">
                Votre compte a été créé. Avant de rejoindre l&apos;espace choriste, prenons quelques
                minutes pour configurer votre profil — cela n&apos;en prendra que trois.
              </p>
            </div>
            <ul className="flex flex-col gap-3 py-4">
              {[
                { icon: '📷', text: 'Ajouter une photo de profil' },
                { icon: '📝', text: 'Renseigner vos informations personnelles' },
                { icon: '🔒', text: 'Choisir ce que les autres choristes peuvent voir' },
              ].map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-foreground/70">
                  <span className="text-lg">{icon}</span>
                  {text}
                </li>
              ))}
            </ul>
            <Button onClick={next} size="lg" className="w-full">
              Commencer
            </Button>
          </div>
        )}

        {/* Step 2 — Photo */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-primary font-medium uppercase tracking-widest mb-2">
                Étape 1 sur 3
              </p>
              <h2 className="text-2xl font-medium text-foreground mb-2">Photo de profil</h2>
              <p className="text-foreground/60 text-sm">
                Votre photo apparaîtra sur le trombinoscope. Elle aide les autres membres à vous
                reconnaître.
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 py-4">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-background-secondary border-2 border-border">
                {(photoPreviewUrl ?? photoUrl) ? (
                  <Image
                    src={photoPreviewUrl ?? photoUrl}
                    alt="Photo de profil"
                    fill
                    className="object-cover"
                    sizes="128px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-foreground/20">
                    👤
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                {photoIsPending ? (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      disabled={photoUploading}
                      onClick={confirmPhoto}
                    >
                      {photoUploading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Upload en cours...
                        </span>
                      ) : '✓ Valider la photo'}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={photoUploading}
                      onClick={cancelPhoto}
                    >
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {photoUrl ? '📷 Changer la photo' : '📷 Choisir une photo'}
                  </Button>
                )}
                <p className="text-xs text-foreground/40">JPG, PNG — format carré recommandé</p>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="link" onClick={next}>
                Passer cette étape
              </Button>
              <Button onClick={next} disabled={photoUploading}>
                Continuer →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 — Infos personnelles */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-primary font-medium uppercase tracking-widest mb-2">
                Étape 2 sur 3
              </p>
              <h2 className="text-2xl font-medium text-foreground mb-2">
                Informations personnelles
              </h2>
              <p className="text-foreground/60 text-sm">
                Ces données permettent au bureau de vous contacter et à vos collègues de vous
                retrouver sur la carte.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-foreground/60 font-medium">Téléphone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  type="tel"
                  inputMode="numeric"
                  className={inputClass}
                  placeholder="06 12 34 56 78"
                  maxLength={14}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-foreground/60 font-medium">Date de naissance</label>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-foreground/60 font-medium">Adresse</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                  placeholder="12 rue de la Paix"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-foreground/60 font-medium">Code postal</label>
                  <input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className={inputClass}
                    placeholder="49000"
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs text-foreground/60 font-medium">Ville</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={inputClass}
                    placeholder="Angers"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="link" onClick={next}>
                Passer cette étape
              </Button>
              <Button onClick={next}>Continuer →</Button>
            </div>
          </div>
        )}

        {/* Step 4 — Confidentialité */}
        {step === 4 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-primary font-medium uppercase tracking-widest mb-2">
                Étape 3 sur 3
              </p>
              <h2 className="text-2xl font-medium text-foreground mb-2">Confidentialité</h2>
              <p className="text-foreground/60 text-sm">
                Choisissez ce que les autres choristes peuvent voir de vous sur le trombinoscope et
                le calendrier. Vous pourrez modifier cela à tout moment dans votre profil.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-background px-4">
              <Switch
                checked={visibilityEmail}
                onChange={setVisibilityEmail}
                label="Adresse email"
                description={visibilityEmail ? 'Visible par les choristes' : 'Masquée'}
              />
              <Switch
                checked={visibilityPhone}
                onChange={setVisibilityPhone}
                label="Numéro de téléphone"
                description={visibilityPhone ? 'Visible par les choristes' : 'Masqué'}
              />
              <Switch
                checked={visibilityAddress}
                onChange={setVisibilityAddress}
                label="Adresse postale"
                description={
                  visibilityAddress
                    ? 'Visible sur le trombinoscope et la carte'
                    : 'Masquée — le CA peut voir votre position'
                }
              />
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-background px-4 py-3">
              <p className="text-sm font-medium text-foreground">Anniversaire sur le calendrier</p>
              <div className="flex gap-2 flex-wrap">
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
                        : 'border-border text-foreground/60 hover:border-foreground/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="link" onClick={next}>
                Passer cette étape
              </Button>
              <Button onClick={next}>Continuer →</Button>
            </div>
          </div>
        )}

        {/* Step 5 — Découvrir */}
        {step === 5 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-primary font-medium uppercase tracking-widest mb-2">
                Prêt !
              </p>
              <h2 className="text-2xl font-medium text-foreground mb-2">
                Par où commencer ?
              </h2>
              <p className="text-foreground/60 text-sm">
                Votre profil est configuré. Voici trois choses à faire dès maintenant pour vous
                sentir chez vous.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  icon: '📅',
                  title: 'Regarder le prochain évènement',
                  desc: `Répétitions, concerts, dates importantes — le calendrier est votre boussole dans la vie de la chorale.`,
                  cta: 'Voir le calendrier',
                  href: '/choristes/calendrier',
                },
                {
                  icon: '🎵',
                  title: 'Consulter les partitions',
                  desc: `Retrouvez les pièces que la chorale travaille en ce moment, avec leur historique de concert.`,
                  cta: 'Ouvrir le répertoire',
                  href: '/choristes/repertoire',
                },
                {
                  icon: '👥',
                  title: 'Mettre des visages sur les voix',
                  desc: `Le trombinoscope vous présente tous vos collègues choristes — photos, pupitres et coordonnées.`,
                  cta: 'Voir le trombinoscope',
                  href: '/choristes/trombinoscope',
                },
              ].map(({ icon, title, desc, cta, href }) => (
                <div
                  key={title}
                  className="flex gap-4 p-4 rounded-2xl border border-border bg-background"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-xs text-foreground/50 leading-relaxed">{desc}</p>
                    <button
                      type="button"
                      onClick={() => handleComplete(href)}
                      disabled={completing}
                      className="text-xs text-primary font-medium mt-1 hover:underline text-left disabled:opacity-50"
                    >
                      {cta} →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={handleComplete} loading={completing} size="lg" className="w-full">
              {completing ? 'Enregistrement...' : "C'est parti — accéder à l'espace choriste"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
