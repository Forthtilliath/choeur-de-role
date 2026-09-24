import { formatPhone } from '@/utils/phoneHelpers';

import { StepHeader, StepNav } from './OnboardingLayout';

export type OnboardingInfo = {
  phone: string;
  birthday: string;
  address: string;
  zipCode: string;
  city: string;
};

const INPUT_CLASS =
  'border border-border rounded-lg px-4 py-2.5 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/30';
const LABEL_CLASS = 'text-xs text-foreground/60 font-medium';

type Props = {
  value: OnboardingInfo;
  onChangeAction: (patch: Partial<OnboardingInfo>) => void;
  onNextAction: () => void;
};

export function InfoStep({ value, onChangeAction, onNextAction }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeader eyebrow="Étape 2 sur 3" title="Informations personnelles">
        Ces données permettent au bureau de vous contacter et à vos collègues de vous retrouver sur
        la carte.
      </StepHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="onboarding-phone" className={LABEL_CLASS}>
            Téléphone
          </label>
          <input
            id="onboarding-phone"
            value={value.phone}
            onChange={(e) => onChangeAction({ phone: formatPhone(e.target.value) })}
            type="tel"
            inputMode="numeric"
            className={INPUT_CLASS}
            placeholder="06 12 34 56 78"
            maxLength={14}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="onboarding-birthday" className={LABEL_CLASS}>
            Date de naissance
          </label>
          <input
            id="onboarding-birthday"
            type="date"
            value={value.birthday}
            onChange={(e) => onChangeAction({ birthday: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="onboarding-address" className={LABEL_CLASS}>
            Adresse
          </label>
          <input
            id="onboarding-address"
            value={value.address}
            onChange={(e) => onChangeAction({ address: e.target.value })}
            className={INPUT_CLASS}
            placeholder="12 rue de la Paix"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="onboarding-zip" className={LABEL_CLASS}>
              Code postal
            </label>
            <input
              id="onboarding-zip"
              value={value.zipCode}
              onChange={(e) => onChangeAction({ zipCode: e.target.value })}
              className={INPUT_CLASS}
              placeholder="49000"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label htmlFor="onboarding-city" className={LABEL_CLASS}>
              Ville
            </label>
            <input
              id="onboarding-city"
              value={value.city}
              onChange={(e) => onChangeAction({ city: e.target.value })}
              className={INPUT_CLASS}
              placeholder="Angers"
            />
          </div>
        </div>
      </div>

      <StepNav onNextAction={onNextAction} />
    </div>
  );
}
