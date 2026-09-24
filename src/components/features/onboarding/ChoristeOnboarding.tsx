'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { completeOnboarding } from '@/app/choristes/bienvenue/actions';
import type { BirthdayVisibility } from '@/components/features/profil/types';

import type { OnboardingInfo } from './InfoStep';
import { InfoStep } from './InfoStep';
import { DiscoverStep, WelcomeStep } from './IntroSteps';
import { StepProgress } from './OnboardingLayout';
import { PhotoStep } from './PhotoStep';
import type { OnboardingVisibility } from './PrivacyStep';
import { PrivacyStep } from './PrivacyStep';

const TOTAL_STEPS = 5;

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
  const [info, setInfo] = useState<OnboardingInfo>({
    phone: initialPhone,
    birthday: initialBirthday,
    address: initialAddress,
    zipCode: initialZipCode,
    city: initialCity,
  });
  const [visibility, setVisibility] = useState<OnboardingVisibility>({
    email: initialVisibilityEmail,
    phone: initialVisibilityPhone,
    address: initialVisibilityAddress,
    birthday: initialVisibilityBirthday,
  });
  const [completing, setCompleting] = useState(false);

  async function handleComplete(destination = '/choristes') {
    setCompleting(true);
    const ok = await completeOnboarding({
      phone: info.phone.replace(/\s/g, '') || null,
      address: info.address || null,
      zip_code: info.zipCode || null,
      city: info.city || null,
      birthday: info.birthday || null,
      visibility_email: visibility.email,
      visibility_phone: visibility.phone,
      visibility_address: visibility.address,
      visibility_birthday: visibility.birthday,
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <StepProgress current={step} total={TOTAL_STEPS} />

        {step === 1 && <WelcomeStep firstName={firstName} onNextAction={next} />}

        {step === 2 && (
          <PhotoStep memberId={memberId} initialPhotoUrl={initialPhotoUrl} onNextAction={next} />
        )}

        {step === 3 && (
          <InfoStep
            value={info}
            onChangeAction={(patch) => setInfo((prev) => ({ ...prev, ...patch }))}
            onNextAction={next}
          />
        )}

        {step === 4 && (
          <PrivacyStep
            value={visibility}
            onChangeAction={(patch) => setVisibility((prev) => ({ ...prev, ...patch }))}
            onNextAction={next}
          />
        )}

        {step === 5 && <DiscoverStep completing={completing} onCompleteAction={handleComplete} />}
      </div>
    </div>
  );
}
