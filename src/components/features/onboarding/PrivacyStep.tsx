import type { BirthdayVisibility } from '@/components/features/profil/types';

import { StepHeader, StepNav } from './OnboardingLayout';

export type OnboardingVisibility = {
  email: boolean;
  phone: boolean;
  address: boolean;
  birthday: BirthdayVisibility;
};

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

type Props = {
  value: OnboardingVisibility;
  onChangeAction: (patch: Partial<OnboardingVisibility>) => void;
  onNextAction: () => void;
};

export function PrivacyStep({ value, onChangeAction, onNextAction }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeader eyebrow="Étape 3 sur 3" title="Confidentialité">
        Choisissez ce que les autres choristes peuvent voir de vous sur le trombinoscope et le
        calendrier. Vous pourrez modifier cela à tout moment dans votre profil.
      </StepHeader>

      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-background px-4">
        <Switch
          checked={value.email}
          onChange={(v) => onChangeAction({ email: v })}
          label="Adresse email"
          description={value.email ? 'Visible par les choristes' : 'Masquée'}
        />
        <Switch
          checked={value.phone}
          onChange={(v) => onChangeAction({ phone: v })}
          label="Numéro de téléphone"
          description={value.phone ? 'Visible par les choristes' : 'Masqué'}
        />
        <Switch
          checked={value.address}
          onChange={(v) => onChangeAction({ address: v })}
          label="Adresse postale"
          description={
            value.address
              ? 'Visible sur le trombinoscope et la carte'
              : 'Masquée — le CA peut voir votre position'
          }
        />
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-background px-4 py-3">
        <p className="text-sm font-medium text-foreground">Anniversaire sur le calendrier</p>
        <div className="flex gap-2 flex-wrap">
          {BIRTHDAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChangeAction({ birthday: opt.value })}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                value.birthday === opt.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground/60 hover:border-foreground/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <StepNav onNextAction={onNextAction} />
    </div>
  );
}
