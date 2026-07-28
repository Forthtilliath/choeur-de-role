'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase.client';

type Props = {
  onClickAction?: () => void;
  initialLoggedIn?: boolean;
};

export function AuthButton({ onClickAction, initialLoggedIn }: Props = {}) {
  const router = useRouter();
  // undefined = on ne sait pas encore, true/false = état connu
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>(initialLoggedIn);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loggedIn === undefined)
    return <div className="w-28 h-8 rounded-lg bg-foreground/10 animate-pulse" />;

  if (loggedIn)
    return (
      <Button onClick={() => { onClickAction?.(); handleSignOut(); }} variant="outline" size="sm">
        Se déconnecter
      </Button>
    );

  return (
    <Button href="/login" onClick={onClickAction} variant="outline" size="sm">
      Espace choristes
    </Button>
  );
}
