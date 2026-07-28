import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase.client';

export function useCheckUser() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await createClient().auth.getUser();
      if (user) {
        router.replace('/choristes');
      } else {
        setChecking(false);
      }
    };
    checkUser();
  }, [router]);

  return checking;
}
