'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/Button';

import { CodeInput, FormError, RestartButton, StepTitle } from './LoginSteps';

const STEP_BADGE_CLASS =
  'shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs';

type Props = {
  qrCode: string;
  secret: string;
  code: string;
  onCodeChangeAction: (code: string) => void;
  loading: boolean;
  error: string;
  onSubmitAction: () => void;
  onRestartAction: () => void;
};

// Étape 2 bis — activation obligatoire de la 2FA pour un compte administrateur
export function MfaSetupStep({
  qrCode,
  secret,
  code,
  onCodeChangeAction,
  loading,
  error,
  onSubmitAction,
  onRestartAction,
}: Props) {
  return (
    <>
      <StepTitle title="Activez la double authentification">
        Requis pour les comptes administrateur. À faire une seule fois — prend moins de 2 minutes.
      </StepTitle>

      <ol className="flex flex-col gap-3">
        <li className="flex gap-3 text-sm text-foreground/70">
          <span className={STEP_BADGE_CLASS}>1</span>
          <span>
            Installez <strong>Google Authenticator</strong> ou <strong>Authy</strong> sur votre
            téléphone (gratuites, App Store ou Google Play).
          </span>
        </li>
        <li className="flex gap-3 text-sm text-foreground/70">
          <span className={STEP_BADGE_CLASS}>2</span>
          <span>
            Ouvrez l&apos;app, appuyez sur <strong>+</strong> puis{' '}
            <strong>Scanner un QR code</strong>.
          </span>
        </li>
        <li className="flex gap-3 text-sm text-foreground/70">
          <span className={STEP_BADGE_CLASS}>3</span>
          <span>Scannez ce code avec votre téléphone :</span>
        </li>
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitAction();
        }}
        className="flex flex-col gap-5"
      >
        {/* URL data: générée par Supabase — rien à optimiser */}
        <Image
          src={qrCode}
          alt="QR code 2FA"
          width={176}
          height={176}
          unoptimized
          className="w-44 h-44 mx-auto bg-white p-2 rounded-xl"
        />

        <details className="text-xs text-foreground/40 cursor-pointer">
          <summary>Pas de caméra ? Saisie manuelle</summary>
          <p className="mt-1">
            Dans l&apos;app, choisissez &laquo;&nbsp;Entrer une clé&nbsp;&raquo; et collez ce code :
          </p>
          <code className="block mt-1 font-mono break-all select-all bg-background-secondary px-2 py-1 rounded">
            {secret}
          </code>
        </details>

        <div className="flex flex-col gap-1">
          <label htmlFor="enroll-code" className="text-sm font-medium text-foreground">
            Étape 4 — Entrez le code à 6 chiffres affiché dans l&apos;app
          </label>
          <CodeInput id="enroll-code" value={code} onChangeAction={onCodeChangeAction} />
        </div>

        <FormError message={error} />

        <Button
          type="submit"
          disabled={code.length !== 6 || loading}
          loading={loading}
          className="w-full"
        >
          {loading ? 'Activation...' : 'Confirmer et accéder'}
        </Button>
      </form>

      <RestartButton loading={loading} onClick={onRestartAction} />
    </>
  );
}
