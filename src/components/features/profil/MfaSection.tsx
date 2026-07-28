'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase.client';

type Status = 'loading' | 'none' | 'enrolled';
type EnrollStep = 'idle' | 'qrcode';

export function MfaSection({ isAdmin }: { isAdmin: boolean }) {
  const [status, setStatus] = useState<Status>('loading');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrollStep, setEnrollStep] = useState<EnrollStep>('idle');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [pendingFactorId, setPendingFactorId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadFactors() {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f) => f.status === 'verified');
    if (verified) {
      setFactorId(verified.id);
      setStatus('enrolled');
    } else {
      setStatus('none');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFactors();
  }, []);

  async function handleEnroll() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `CDR (${user?.email ?? 'compte'})`,
    });
    setLoading(false);
    if (error || !data) {
      toast.error("Erreur lors de l'activation de la 2FA");
      return;
    }
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setPendingFactorId(data.id);
    setEnrollStep('qrcode');
  }

  async function handleConfirm() {
    if (code.length !== 6) return;
    setLoading(true);
    const supabase = createClient();
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: pendingFactorId,
    });
    if (challengeError) {
      toast.error('Erreur lors de la vérification');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: pendingFactorId,
      challengeId: challenge.id,
      code,
    });
    setLoading(false);
    if (error) {
      toast.error('Code incorrect -- réessayez');
      setCode('');
      return;
    }
    setFactorId(pendingFactorId);
    setStatus('enrolled');
    setEnrollStep('idle');
    setCode('');
    toast.success('Double authentification activée');
  }

  async function handleUnenroll() {
    if (!factorId) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setLoading(false);
    if (error) {
      toast.error('Erreur lors de la désactivation');
      return;
    }
    setFactorId(null);
    setStatus('none');
    toast.success('Double authentification désactivée');
  }

  if (status === 'loading') return null;

  return (
    <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
            {status === 'enrolled' ? (
              <ShieldCheck size={15} className="text-primary" />
            ) : (
              <ShieldOff size={15} className="text-foreground/40" />
            )}
            Double authentification (2FA)
          </h2>
          <p className="text-xs text-foreground/50 mt-0.5">
            {status === 'enrolled' && "Activée — un code vous sera demandé à chaque connexion."}
            {status !== 'enrolled' && isAdmin && "Requise pour les comptes administrateur."}
            {status !== 'enrolled' && !isAdmin && "Désactivée — protégez votre compte avec Google Authenticator, Authy, etc."}
          </p>
        </div>
        {status === 'enrolled' ? (
          <Button size="sm" variant="danger" onClick={handleUnenroll} loading={loading} disabled={loading}>
            Désactiver
          </Button>
        ) : enrollStep === 'idle' ? (
          <Button size="sm" onClick={handleEnroll} loading={loading} disabled={loading}>
            Activer
          </Button>
        ) : null}
      </div>

      {enrollStep === 'qrcode' && (
        <div className="flex flex-col gap-5 pt-4 border-t border-border">
          <ol className="flex flex-col gap-2">
            <li className="flex gap-3 text-xs text-foreground/70">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center text-[10px]">1</span>
              <span>
                Installez une application d&apos;authentification sur votre téléphone :{' '}
                <strong>Google Authenticator</strong> ou <strong>Authy</strong> (gratuites, App Store / Google Play).
              </span>
            </li>
            <li className="flex gap-3 text-xs text-foreground/70">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center text-[10px]">2</span>
              <span>Ouvrez l&apos;app, appuyez sur <strong>+</strong> ou <strong>Ajouter un compte</strong>, puis choisissez <strong>Scanner un QR code</strong>.</span>
            </li>
            <li className="flex gap-3 text-xs text-foreground/70">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center text-[10px]">3</span>
              <span>Scannez le code ci-dessous avec votre téléphone.</span>
            </li>
            <li className="flex gap-3 text-xs text-foreground/70">
              <span className="shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center text-[10px]">4</span>
              <span>Entrez le code à 6 chiffres affiché dans l&apos;app pour confirmer.</span>
            </li>
          </ol>

          <img
            src={qrCode}
            alt="QR code 2FA"
            className="w-44 h-44 mx-auto bg-white p-2 rounded-xl"
          />

          <details className="text-xs text-foreground/40 cursor-pointer">
            <summary>Pas de caméra ? Saisie manuelle</summary>
            <p className="mt-1 text-foreground/40">Dans l&apos;app, choisissez &laquo;&nbsp;Entrer une clé de configuration&nbsp;&raquo; et collez ce code :</p>
            <code className="block mt-1 font-mono break-all select-all bg-background-secondary px-2 py-1 rounded">{secret}</code>
          </details>

          <div className="flex gap-3">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus
              className="flex-1 border border-border rounded-lg px-4 py-2 text-sm bg-background text-center tracking-widest font-mono focus:outline-none focus:border-primary transition-colors"
            />
            <Button onClick={handleConfirm} disabled={code.length !== 6 || loading} loading={loading}>
              Confirmer
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEnrollStep('idle');
                setCode('');
              }}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
