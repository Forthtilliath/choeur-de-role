import { NextResponse } from 'next/server';
import { z } from 'zod';

import { toApiError } from '@/lib/apiError';
import { clearLoginAttempts, lockoutMessage, registerLoginAttempt } from '@/lib/loginLockout';
import { createServerClient } from '@/lib/supabase.server';

const bodySchema = z.object({ email: z.string().trim().max(320).pipe(z.email()) }).strip();

// Portillon appelé avant chaque connexion : 3 essais, puis 5 minutes de blocage
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  try {
    const lockedUntil = await registerLoginAttempt(parsed.data.email);
    if (lockedUntil) {
      const retryAfter = Math.ceil((lockedUntil.getTime() - Date.now()) / 1000);
      return NextResponse.json(
        { error: lockoutMessage(lockedUntil) },
        { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfter)) } },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return toApiError(e);
  }
}

// Mot de passe correct : on remet le compteur du compte connecté à zéro
export async function DELETE() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({}, { status: 401 });

  try {
    await clearLoginAttempts(user.email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return toApiError(e);
  }
}
