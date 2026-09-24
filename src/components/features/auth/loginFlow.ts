import { createClient } from '@/lib/supabase.client';

type SupabaseClient = ReturnType<typeof createClient>;

export type LoginOutcome =
  | { kind: 'error'; message: string }
  | { kind: 'done' }
  | { kind: 'mfa'; factorId: string }
  | { kind: 'mfa-setup'; qrCode: string; secret: string; factorId: string };

export function recordLogin() {
  fetch('/api/auth/record-login', { method: 'POST' }).catch(() => {});
}

// Supprime les facteurs 2FA non vérifiés laissés par une tentative avortée,
// pour que l'enrôlement reparte propre (un seul QR code à la fois).
export async function purgeUnverifiedFactors(supabase: SupabaseClient) {
  const { data } = await supabase.auth.mfa.listFactors();
  const stale = (data?.all ?? []).filter((f) => f.status !== 'verified');
  await Promise.all(
    stale.map((f) => supabase.auth.mfa.unenroll({ factorId: f.id }).catch(() => {})),
  );
}

// Abandon de l'étape 2FA : purge des facteurs en attente puis déconnexion locale
export async function abandonMfa() {
  const supabase = createClient();
  await purgeUnverifiedFactors(supabase);
  await supabase.auth.signOut({ scope: 'local' });
}

// Connexion par mot de passe puis détermination de l'étape suivante :
// 2FA obligatoire pour les admins (enrôlement si absente), facultative pour les choristes.
export async function signIn(email: string, password: string): Promise<LoginOutcome> {
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) return { kind: 'error', message: 'Email ou mot de passe incorrect' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: memberData, error: memberError } = await supabase
    .from('members')
    .select('role')
    .eq('id', user!.id)
    .single();

  if (memberError || !memberData) {
    // Impossible de vérifier le rôle → on n'ouvre pas de session bancale
    await supabase.auth.signOut({ scope: 'local' });
    return { kind: 'error', message: 'Impossible de vérifier votre compte, réessayez.' };
  }

  const userIsAdmin = memberData.role === 'admin' || memberData.role === 'super_admin';

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totpFactor = factors?.totp?.find((f) => f.status === 'verified');

  if (userIsAdmin) {
    if (!totpFactor) {
      // Admin sans 2FA vérifiée → on repart de zéro : purge des facteurs
      // en attente d'une tentative précédente, puis (ré)affichage du QR code.
      await purgeUnverifiedFactors(supabase);

      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `CDR Admin (${email})`,
      });
      if (enrollError || !enrollData) {
        return { kind: 'error', message: 'Erreur lors de la configuration de la 2FA' };
      }
      return {
        kind: 'mfa-setup',
        qrCode: enrollData.totp.qr_code,
        secret: enrollData.totp.secret,
        factorId: enrollData.id,
      };
    }
    // Admin avec 2FA → vérification obligatoire
    return { kind: 'mfa', factorId: totpFactor.id };
  }

  // Choriste : vérification seulement s'il a activé la 2FA
  if (totpFactor) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== aal.nextLevel) {
      return { kind: 'mfa', factorId: totpFactor.id };
    }
  }

  return { kind: 'done' };
}

// Vérifie un code TOTP ; renvoie un message d'erreur, ou null si le code est valide
export async function verifyTotpCode(factorId: string, code: string): Promise<string | null> {
  const supabase = createClient();
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });
  if (challengeError) return 'Erreur de vérification, réessayez';

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });
  return verifyError ? 'Code incorrect' : null;
}
