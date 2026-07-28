'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase.client';

export default function ConfirmClientPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    // Supabase détecte automatiquement le fragment #access_token dans l'URL
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/choristes');
      }
    });

    // Forcer la détection de session depuis le fragment
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/choristes');
    });
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center flex flex-col gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-foreground/50">Activation en cours...</p>
      </div>
    </main>
  );
}
