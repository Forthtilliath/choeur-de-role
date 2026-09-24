'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/Button';

const INPUT_CLASS =
  'border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors';
const CODE_INPUT_CLASS =
  'border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-lg text-center tracking-widest font-mono focus:outline-none focus:border-primary transition-colors';

// Champ de code TOTP à 6 chiffres (chiffres uniquement)
export function CodeInput({
  id,
  value,
  onChangeAction,
  autoFocus,
}: {
  id: string;
  value: string;
  onChangeAction: (code: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      value={value}
      onChange={(e) => onChangeAction(e.target.value.replace(/\D/g, '').slice(0, 6))}
      placeholder="000000"
      autoFocus={autoFocus}
      autoComplete="one-time-code"
      className={CODE_INPUT_CLASS}
    />
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
      {message}
    </p>
  );
}

export function StepTitle({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-medium text-foreground">{title}</h1>
      <p className="text-sm text-foreground/50">{children}</p>
    </div>
  );
}

export function RestartButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="text-xs text-foreground/40 hover:text-foreground text-center transition-colors disabled:opacity-50"
    >
      ← Recommencer la connexion
    </button>
  );
}

// Étape 1 — identifiants
export function CredentialsStep({
  loading,
  error,
  onSubmitAction,
}: {
  loading: boolean;
  error: string;
  onSubmitAction: (email: string, password: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    onSubmitAction(
      (form.elements.namedItem('email') as HTMLInputElement).value,
      (form.elements.namedItem('password') as HTMLInputElement).value,
    );
  }

  return (
    <>
      <StepTitle title="Bon retour !">
        Connectez-vous pour accéder à l&apos;espace choristes.
      </StepTitle>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="login-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="votre@email.com"
            required
            autoComplete="email"
            className={INPUT_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="login-password" className="text-sm font-medium text-foreground">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className={`w-full pr-11 ${INPUT_CLASS}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <FormError message={error} />

        <Button type="submit" disabled={loading} loading={loading} className="w-full mt-2">
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <p className="text-xs text-foreground/30 text-center">
        Vous n&apos;avez pas de compte ? Contactez un administrateur.
      </p>
    </>
  );
}

// Étape 2 — code de l'application d'authentification
export function MfaStep({
  code,
  onCodeChangeAction,
  loading,
  error,
  onSubmitAction,
  onRestartAction,
}: {
  code: string;
  onCodeChangeAction: (code: string) => void;
  loading: boolean;
  error: string;
  onSubmitAction: () => void;
  onRestartAction: () => void;
}) {
  return (
    <>
      <StepTitle title="Vérification en deux étapes">
        Entrez le code à 6 chiffres de votre application d&apos;authentification.
      </StepTitle>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmitAction();
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="mfa-code" className="text-sm font-medium text-foreground">
            Code d&apos;authentification
          </label>
          <CodeInput id="mfa-code" value={code} onChangeAction={onCodeChangeAction} autoFocus />
        </div>

        <FormError message={error} />

        <Button
          type="submit"
          disabled={code.length !== 6 || loading}
          loading={loading}
          className="w-full mt-2"
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </Button>
      </form>

      <RestartButton loading={loading} onClick={onRestartAction} />
    </>
  );
}
