import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/auditLog';
import { sendPasswordResetEmail } from '@/lib/email';
import { generatePassphrase } from '@/lib/passphrase';
import { checkRateLimit } from '@/lib/rateLimit';
import { createAdminClient, createServerClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: callerMember } = await supabase
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!callerMember || !['admin', 'super_admin'].includes(callerMember.role ?? '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const adminClient = createAdminClient();

    if (body.all) {
      if (callerMember.role !== 'super_admin') {
        return NextResponse.json({ error: 'Réservé au super administrateur' }, { status: 403 });
      }
      if (!checkRateLimit(`reset-all:${user.id}`, 1, 5 * 60 * 1000)) {
        return NextResponse.json({ error: 'Déjà exécuté récemment, attendez 5 minutes.' }, { status: 429 });
      }
      const { data: allMembers } = await supabase
        .from('members')
        .select('id, first_name, email')
        .not('email', 'is', null);

      if (!allMembers?.length) return NextResponse.json({ count: 0 });

      const {
        data: { users: authUsers },
      } = await adminClient.auth.admin.listUsers({ perPage: 1000 });

      const confirmedIds = new Set(
        authUsers.filter((u) => u.email_confirmed_at).map((u) => u.id),
      );

      const confirmed = allMembers.filter((m) => confirmedIds.has(m.id) && m.email);

      const results = await Promise.allSettled(
        confirmed.map(async (m) => {
          const passphrase = generatePassphrase(3);
          await adminClient.auth.admin.updateUserById(m.id, { password: passphrase });
          await sendPasswordResetEmail({
            to: m.email!,
            firstName: m.first_name ?? 'Choriste',
            passphrase,
          });
        }),
      );

      const count = results.filter((r) => r.status === 'fulfilled').length;
      await logAudit({
        actorId: user.id,
        action: 'password_reset_all',
        details: { count },
        ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      });
      return NextResponse.json({ count });
    }

    if (!checkRateLimit(`reset-single:${user.id}`, 10, 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de réinitialisations, attendez une minute.' }, { status: 429 });
    }

    const { memberId } = body;
    if (!memberId) return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });

    const { data: targetMember } = await supabase
      .from('members')
      .select('first_name, email')
      .eq('id', memberId)
      .single();

    if (!targetMember?.email) {
      return NextResponse.json({ error: 'Membre introuvable ou sans email' }, { status: 400 });
    }

    const passphrase = generatePassphrase(3);
    const { error: authError } = await adminClient.auth.admin.updateUserById(memberId, {
      password: passphrase,
    });
    if (authError) return NextResponse.json({ error: 'Erreur lors de la réinitialisation du mot de passe.' }, { status: 400 });

    await sendPasswordResetEmail({
      to: targetMember.email,
      firstName: targetMember.first_name ?? 'Choriste',
      passphrase,
    });

    await logAudit({
      actorId: user.id,
      action: 'password_reset',
      targetId: memberId,
      details: { email: targetMember.email },
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return toApiError(e);
  }
}
