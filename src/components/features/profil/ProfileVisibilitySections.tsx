import type { ProfileFormValues } from './profileForm';

const BIRTHDAY_OPTIONS = [
  { value: 'none', label: 'Ne pas partager' },
  { value: 'date_only', label: 'Date uniquement' },
  { value: 'date_and_age', label: 'Date et âge' },
] as const;

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

function SectionHeader({ title }: { title: string }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      <p className="text-xs text-foreground/40 mt-0.5">
        Choisissez ce que les autres choristes peuvent voir de vous.
      </p>
    </div>
  );
}

type Props = {
  values: ProfileFormValues;
  onChangeAction: (patch: Partial<ProfileFormValues>) => void;
};

// Réglages de visibilité : trombinoscope (email, téléphone, adresse) et calendrier (anniversaire)
export function ProfileVisibilitySections({ values, onChangeAction }: Props) {
  return (
    <>
      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
        <SectionHeader title="Visibilité sur le trombinoscope" />
        <div className="flex flex-col divide-y divide-border">
          <div className="pb-3">
            <Switch
              checked={values.visibilityEmail}
              onChange={(v) => onChangeAction({ visibilityEmail: v })}
              label="Adresse email"
              description={values.visibilityEmail ? 'Visible par les autres choristes' : 'Masquée'}
            />
          </div>
          <div className="py-3">
            <Switch
              checked={values.visibilityPhone}
              onChange={(v) => onChangeAction({ visibilityPhone: v })}
              label="Numéro de téléphone"
              description={values.visibilityPhone ? 'Visible par les autres choristes' : 'Masqué'}
            />
          </div>
          <div className="pt-3">
            <Switch
              checked={values.visibilityAddress}
              onChange={(v) => onChangeAction({ visibilityAddress: v })}
              label="Adresse postale + carte"
              description={
                values.visibilityAddress
                  ? 'Visible sur le trombinoscope et la carte'
                  : 'Masquée des choristes — le CA peut voir votre position sur la carte'
              }
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
        <SectionHeader title="Visibilité sur le calendrier" />
        <div className="flex flex-col divide-y divide-border">
          <div className="pb-3">
            <p className="text-xs font-medium text-foreground">Anniversaire</p>
            <p className="text-xs text-foreground/40">
              Partagez votre anniversaire sur le calendrier.
            </p>
            <div className="flex gap-2 mt-2">
              {BIRTHDAY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChangeAction({ visibilityBirthday: opt.value })}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    values.visibilityBirthday === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {values.visibilityBirthday !== 'none' && !values.birthday && (
              <p className="text-xs text-orange-500">
                ⚠️ Renseignez votre date de naissance pour activer le partage.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
