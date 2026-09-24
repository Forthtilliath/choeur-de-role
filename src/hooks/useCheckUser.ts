import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase.client';

/**
 * Contrôle d'entrée de la page de login :
 *  - visiteur non connecté            → affiche le formulaire
 *  - session complète                 → redirige vers /choristes
 *  - session incomplète (admin sans
 *    2FA vérifiée, ou 2FA jamais
 *    validée sur cette session)       → déconnecte et réaffiche le formulaire
 *
 * Ce dernier cas évite de rester bloqué « connecté mais sans accès admin »
 * après une réinitialisation manuelle de la 2FA : on relance la manip depuis
 * le début plutôt que de la poursuivre.
 */
export function useCheckUser() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setChecking(false);
        return;
      }

      const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single();
      const isAdmin = member?.role === 'admin' || member?.role === 'super_admin';

      const [{ data: factors }, { data: aal }] = await Promise.all([
        supabase.auth.mfa.listFactors(),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      const hasVerifiedTotp = factors?.totp?.some((f) => f.status === 'verified');
      const mfaNotSatisfied =
        !!aal && aal.nextLevel === 'aal2' && aal.currentLevel !== aal.nextLevel;

      if ((isAdmin && !hasVerifiedTotp) || mfaNotSatisfied) {
        await supabase.auth.signOut({ scope: 'local' });
        setChecking(false);
        return;
      }

      router.replace('/choristes');
    };
    void run();
  }, [router]);

  return checking;
}
