'use client';

import { useCallback, useEffect, useState } from 'react';
import { Subscription } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { RoleInfo, buildRoleInfo, isValidDbRole } from '@/lib/roles';
import { createClient } from '@/lib/supabase.client';

type UseRoleReturn = RoleInfo & {
  loading: boolean;
  error: string | null;
};

const LOGGED_OUT: RoleInfo = buildRoleInfo(null);

export function useRole(): UseRoleReturn {
  const [roleInfo, setRoleInfo] = useState<RoleInfo>(LOGGED_OUT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchRole = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setRoleInfo(LOGGED_OUT);
        return;
      }

      const { data, error: memberError } = await supabase
        .from('members')
        .select('role')
        .eq('id', user.id)
        .single();

      if (memberError || !data) {
        setRoleInfo(LOGGED_OUT);
        return;
      }

      const role = isValidDbRole(data?.role) ? data.role : null;
      setRoleInfo(buildRoleInfo(role));
    } catch (err) {
      console.error('[useRole]', err);
      setError('Impossible de récupérer le rôle');
      setRoleInfo(LOGGED_OUT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let subscription: Subscription;

    const fetchAndSubscribe = async () => {
      await fetchRole();

      const { data } = createClient().auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          setRoleInfo(LOGGED_OUT);
          setError(null);
          setLoading(false);
          router.refresh();
        } else if (event === 'SIGNED_IN') {
          fetchRole();
          router.refresh();
        }
      });
      subscription = data.subscription;
    };

    fetchAndSubscribe();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [fetchRole, router]);
  return { ...roleInfo, loading, error };
}
