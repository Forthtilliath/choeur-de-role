'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import {
  abandonMfa,
  recordLogin,
  signIn,
  verifyTotpCode,
} from '@/components/features/auth/loginFlow';
import { CredentialsStep, MfaStep } from '@/components/features/auth/LoginSteps';
import { MfaSetupStep } from '@/components/features/auth/MfaSetupStep';
import { Button } from '@/components/ui/Button';
import { useCheckUser } from '@/hooks/useCheckUser';

type Step = 'login' | 'mfa' | 'mfa-setup';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const checking = useCheckUser();

  const urlError =
    searchParams.get('error') === 'lien_invalide'
      ? "Ce lien d'activation est invalide ou expiré. Contactez un administrateur."
      : '';
  const [error, setError] = useState(urlError);
  const [step, setStep] = useState<Step>('login');

  // MFA verification
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  // MFA enrollment (admin sans 2FA)
  const [enrollQrCode, setEnrollQrCode] = useState('');
  const [enrollSecret, setEnrollSecret] = useState('');
  const [enrollFactorId, setEnrollFactorId] = useState('');
  const [enrollCode, setEnrollCode] = useState('');

  function finishLogin() {
    recordLogin();
    router.push('/choristes');
    router.refresh();
  }

  // Abandon de l'étape 2FA → on réinitialise complètement : purge des facteurs
  // en attente, déconnexion, retour au formulaire. La prochaine tentative
  // recommence la manip depuis le début.
  async function resetToLogin() {
    setLoading(true);
    await abandonMfa();
    setStep('login');
    setMfaCode('');
    setMfaFactorId('');
    setEnrollCode('');
    setEnrollQrCode('');
    setEnrollSecret('');
    setEnrollFactorId('');
    setError('');
    setLoading(false);
  }

  async function handleSignIn(email: string, password: string) {
    setLoading(true);
    setError('');
    const outcome = await signIn(email, password);
    switch (outcome.kind) {
      case 'error':
        setError(outcome.message);
        break;
      case 'mfa':
        setMfaFactorId(outcome.factorId);
        setStep('mfa');
        break;
      case 'mfa-setup':
        setEnrollQrCode(outcome.qrCode);
        setEnrollSecret(outcome.secret);
        setEnrollFactorId(outcome.factorId);
        setStep('mfa-setup');
        break;
      case 'done':
        finishLogin();
        return;
    }
    setLoading(false);
  }

  // Vérifie le code saisi ; en cas d'échec, affiche l'erreur et vide le champ
  async function handleVerify(factorId: string, code: string, clearCode: () => void) {
    setLoading(true);
    setError('');
    const verifyError = await verifyTotpCode(factorId, code);
    if (verifyError) {
      setError(verifyError);
      if (verifyError === 'Code incorrect') clearCode();
      setLoading(false);
      return;
    }
    finishLogin();
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex">
      {/* Partie gauche — photo */}
      <div className="hidden md:flex md:w-1/2 relative bg-background-secondary h-full-wo-header">
        <Image
          src="/images/chorale-groupe.jpg"
          alt="Chœur de Rôle"
          fill
          sizes="50vw"
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/30 to-black/80" />
        <div className="absolute bottom-12 left-0 right-0 px-10">
          <p className="text-white text-3xl font-medium leading-snug drop-shadow-lg">
            Chœur de Rôle
          </p>
          <p className="text-white/80 text-sm mt-2 drop-shadow">Espace réservé aux choristes</p>
        </div>
      </div>

      {/* Partie droite — formulaire */}
      <div className="flex-1 relative flex flex-col items-center justify-center px-8 py-8 md:py-16 bg-background min-h-dvh md:min-h-0">
        <Button href="/" variant="link" className="absolute top-6 left-6 flex items-center gap-1">
          ← Retour au site
        </Button>

        <div className="w-full max-w-sm flex flex-col gap-8">
          {step === 'login' && (
            <CredentialsStep loading={loading} error={error} onSubmitAction={handleSignIn} />
          )}

          {step === 'mfa' && (
            <MfaStep
              code={mfaCode}
              onCodeChangeAction={setMfaCode}
              loading={loading}
              error={error}
              onSubmitAction={() => handleVerify(mfaFactorId, mfaCode, () => setMfaCode(''))}
              onRestartAction={resetToLogin}
            />
          )}

          {step === 'mfa-setup' && (
            <MfaSetupStep
              qrCode={enrollQrCode}
              secret={enrollSecret}
              code={enrollCode}
              onCodeChangeAction={setEnrollCode}
              loading={loading}
              error={error}
              onSubmitAction={() =>
                handleVerify(enrollFactorId, enrollCode, () => setEnrollCode(''))
              }
              onRestartAction={resetToLogin}
            />
          )}
        </div>
      </div>
    </main>
  );
}
