import { env } from '@/env';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/auditLog';
import { sendEmailChangeEmail } from '@/lib/email';
import { createAdminClient, createServerClient } from '@/lib/supabase.server';
import {
  getMemberRole,
  getMemberFirstName,
  updateMemberEmail,
} from '@/components/features/membres/queries';
import { toApiError } from '@/lib/apiError';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const role = await getMemberRole(user.id);
  if (!role || !['admin', 'super_admin'].includes(role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { memberId, email } = await request.json();
  if (!memberId || !email) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  try {
    const targetMember = await getMemberFirstName(memberId);
    if (!targetMember) {
      return NextResponse.json({ error: 'Membre introuvable' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { error: authError } = await adminClient.auth.admin.updateUserById(memberId, {
      email,
      email_confirm: false,
    });

    if (authError) return NextResponse.json({ error: "Erreur lors de la mise à jour de l'adresse email." }, { status: 400 });

    const ok = await updateMemberEmail(memberId, email);
    if (!ok) return NextResponse.json({ error: 'Erreur base de données' }, { status: 400 });

    const { data: linkData } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    const confirmationUrl =
      linkData?.properties?.action_link ?? `${env.NEXT_PUBLIC_SITE_URL}/login`;

    await sendEmailChangeEmail({
      to: email,
      firstName: targetMember.first_name ?? 'Choriste',
      confirmationUrl,
    });

    await logAudit({
      actorId: user.id,
      action: 'email_change',
      targetId: memberId,
      details: { new_email: email },
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return toApiError(e);
  }
}
