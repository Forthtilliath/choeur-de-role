import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/choristes';

  const supabase = await createServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await recordLastLogin(supabase);
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/login?error=lien_invalide`);
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'magiclink' | 'recovery' | 'email',
    });
    if (!error) {
      await recordLastLogin(supabase);
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(`${origin}/login?error=lien_invalide`);
  }

  return NextResponse.redirect(`${origin}/login?error=lien_invalide`);
}

async function recordLastLogin(supabase: Awaited<ReturnType<typeof createServerClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from('members')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', user.id);
}
