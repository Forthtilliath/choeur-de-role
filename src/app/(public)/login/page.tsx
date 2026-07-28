'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useCheckUser } from '@/hooks/useCheckUser';
import { createClient } from '@/lib/supabase.client';

type Step = 'login' | 'mfa' | 'mfa-setup';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  function recordLogin() {
    fetch('/api/auth/record-login', { method: 'POST' }).catch(() => {});
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Email ou mot de passe incorrect');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: memberData } = await supabase
      .from('members')
      .select('role')
      .eq('id', user!.id)
      .single();
    const userIsAdmin =
      memberData?.role === 'admin' || memberData?.role === 'super_admin';

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.totp?.find((f) => f.status === 'verified');

    if (userIsAdmin) {
      if (!totpFactor) {
        // Admin sans 2FA → enrollment obligatoire
        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: `CDR Admin (${(form.elements.namedItem('email') as HTMLInputElement).value})`,
        });
        if (enrollError || !enrollData) {
          setError("Erreur lors de la configuration de la 2FA");
          setLoading(false);
          return;
        }
        setEnrollQrCode(enrollData.totp.qr_code);
        setEnrollSecret(enrollData.totp.secret);
        setEnrollFactorId(enrollData.id);
        setStep('mfa-setup');
        setLoading(false);
        return;
      }
      // Admin avec 2FA → vérification obligatoire
      setMfaFactorId(totpFactor.id);
      setStep('mfa');
      setLoading(false);
      return;
    }

    // Choriste : vérification seulement s'il a activé la 2FA
    if (totpFactor) {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== aal.nextLevel) {
        setMfaFactorId(totpFactor.id);
        setStep('mfa');
        setLoading(false);
        return;
      }
    }

    recordLogin();
    router.push('/choristes');
    router.refresh();
  }

  async function handleMfaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: mfaFactorId,
    });
    if (challengeError) {
      setError('Erreur de vérification, réessayez');
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challenge.id,
      code: mfaCode,
    });
    if (verifyError) {
      setError('Code incorrect');
      setMfaCode('');
      setLoading(false);
      return;
    }

    recordLogin();
    router.push('/choristes');
    router.refresh();
  }

  async function handleEnrollSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enrollFactorId,
    });
    if (challengeError) {
      setError('Erreur de vérification, réessayez');
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrollFactorId,
      challengeId: challenge.id,
      code: enrollCode,
    });
    if (verifyError) {
      setError('Code incorrect');
      setEnrollCode('');
      setLoading(false);
      return;
    }

    recordLogin();
    router.push('/choristes');
    router.refresh();
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
            <>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-medium text-foreground">Bon retour !</h1>
                <p className="text-sm text-foreground/50">
                  Connectez-vous pour accéder à l&apos;espace choristes.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    autoComplete="email"
                    className="border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">Mot de passe</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full border border-border rounded-lg px-4 py-2.5 pr-11 bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
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

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={loading} loading={loading} className="w-full mt-2">
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>

              <p className="text-xs text-foreground/30 text-center">
                Vous n&apos;avez pas de compte ? Contactez un administrateur.
              </p>
            </>
          )}

          {step === 'mfa' && (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-medium text-foreground">Vérification en deux étapes</h1>
                <p className="text-sm text-foreground/50">
                  Entrez le code à 6 chiffres de votre application d&apos;authentification.
                </p>
              </div>

              <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">
                    Code d&apos;authentification
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    autoFocus
                    autoComplete="one-time-code"
                    className="border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-lg text-center tracking-widest font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={mfaCode.length !== 6 || loading}
                  loading={loading}
                  className="w-full mt-2"
                >
                  {loading ? 'Vérification...' : 'Vérifier'}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => { setStep('login'); setMfaCode(''); setError(''); }}
                className="text-xs text-foreground/40 hover:text-foreground text-center transition-colors"
              >
                ← Retour à la connexion
              </button>
            </>
          )}

          {step === 'mfa-setup' && (
            <>
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-medium text-foreground">
                  Activez la double authentification
                </h1>
                <p className="text-sm text-foreground/50">
                  Requis pour les comptes administrateur. À faire une seule fois — prend moins de 2 minutes.
                </p>
              </div>

              <ol className="flex flex-col gap-3">
                <li className="flex gap-3 text-sm text-foreground/70">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">1</span>
                  <span>
                    Installez <strong>Google Authenticator</strong> ou <strong>Authy</strong> sur votre téléphone
                    (gratuites, App Store ou Google Play).
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/70">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">2</span>
                  <span>Ouvrez l&apos;app, appuyez sur <strong>+</strong> puis <strong>Scanner un QR code</strong>.</span>
                </li>
                <li className="flex gap-3 text-sm text-foreground/70">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs">3</span>
                  <span>Scannez ce code avec votre téléphone :</span>
                </li>
              </ol>

              <form onSubmit={handleEnrollSubmit} className="flex flex-col gap-5">
                <img
                  src={enrollQrCode}
                  alt="QR code 2FA"
                  className="w-44 h-44 mx-auto bg-white p-2 rounded-xl"
                />

                <details className="text-xs text-foreground/40 cursor-pointer">
                  <summary>Pas de caméra ? Saisie manuelle</summary>
                  <p className="mt-1">Dans l&apos;app, choisissez &laquo;&nbsp;Entrer une clé&nbsp;&raquo; et collez ce code :</p>
                  <code className="block mt-1 font-mono break-all select-all bg-background-secondary px-2 py-1 rounded">{enrollSecret}</code>
                </details>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-foreground">
                    Étape 4 — Entrez le code à 6 chiffres affiché dans l&apos;app
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={enrollCode}
                    onChange={(e) => setEnrollCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    autoComplete="one-time-code"
                    className="border border-border rounded-lg px-4 py-2.5 bg-background text-foreground text-lg text-center tracking-widest font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={enrollCode.length !== 6 || loading}
                  loading={loading}
                  className="w-full"
                >
                  {loading ? 'Activation...' : 'Confirmer et accéder'}
                </Button>
              </form>

              <button
                type="button"
                onClick={() => { setStep('login'); setEnrollCode(''); setError(''); }}
                className="text-xs text-foreground/40 hover:text-foreground text-center transition-colors"
              >
                ← Retour à la connexion
              </button>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
