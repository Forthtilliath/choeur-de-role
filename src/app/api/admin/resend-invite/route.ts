import { env } from '@/env';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/auditLog';
import { sendWelcomeEmail } from '@/lib/email';
import { generatePassphrase } from '@/lib/passphrase';
import { createAdminClient, createServerClient } from '@/lib/supabase.server';
import { getMemberRole, getMemberEmailAndFirstName } from '@/components/features/membres/queries';
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

  const { memberId } = await request.json();

  try {
    const adminClient = createAdminClient();

    const targetMember = await getMemberEmailAndFirstName(memberId);
    if (!targetMember?.email) {
      return NextResponse.json({ error: 'Email introuvable' }, { status: 400 });
    }

    const passphrase = generatePassphrase(4);
    await adminClient.auth.admin.updateUserById(memberId, { password: passphrase });

    const { data: linkData } = await adminClient.auth.admin.generateLink({
      type: 'signup',
      email: targetMember.email,
      password: passphrase,
      options: {
        redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    const confirmationUrl =
      linkData?.properties?.action_link ?? `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    await sendWelcomeEmail({
      to: targetMember.email,
      firstName: targetMember.first_name ?? 'Choriste',
      passphrase,
      confirmationUrl,
    });

    await logAudit({
      actorId: user.id,
      action: 'resend_invite',
      targetId: memberId,
      details: { email: targetMember.email },
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return toApiError(e);
  }
}
