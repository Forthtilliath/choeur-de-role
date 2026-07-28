import { env } from '@/env';
import { NextResponse } from 'next/server';
import { MemberInsert } from '@/components/features/trombinoscope';
import { getUserQuery } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { sendWelcomeEmail } from '@/lib/email';
import { generatePassphrase } from '@/lib/passphrase';
import { MEMBER_ROLES } from '@/lib/roles';
import { createAdminClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

export async function POST(request: Request) {
  const userQuery = await getUserQuery();
  if (!userQuery.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { first_name, last_name, email, voice_part_id, season_ids, role, skip_email } = body;

  if (!email || !first_name || !last_name) {
    return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
  }

  const isSuperAdmin = userQuery.role === 'super_admin';

  if (skip_email && !isSuperAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const passphrase = generatePassphrase(3);
    const adminSupabase = createAdminClient();

    const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password: passphrase,
      email_confirm: skip_email ? true : false,
      phone_confirm: false,
      user_metadata: { first_name, last_name },
    });

    if (authError) {
      return NextResponse.json({ error: 'Erreur lors de la création du compte.' }, { status: 400 });
    }

    const memberUpdate: MemberInsert = {
      first_name,
      last_name,
      email,
      voice_part_id: voice_part_id || null,
    };

    if (isSuperAdmin && role && MEMBER_ROLES.includes(role) && role !== 'super_admin') {
      memberUpdate.role = role;
    }

    const { data: memberData, error: memberError } = await adminSupabase
      .from('members')
      .update(memberUpdate)
      .eq('id', newUser.user.id)
      .select(`*, voice_parts!members_voice_part_id_fkey (id, name), member_season (season_id)`)
      .single();

    if (memberError) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du membre.' }, { status: 400 });
    }

    const seasonIds: string[] = Array.isArray(season_ids) ? season_ids : [];
    if (seasonIds.length > 0) {
      const { error: seasonError } = await adminSupabase
        .from('member_season')
        .insert(seasonIds.map((season_id) => ({ member_id: newUser.user.id, season_id })));
      if (seasonError) {
        return NextResponse.json({ error: "Erreur lors de l'inscription à la saison." }, { status: 400 });
      }
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    await logAudit({
      actorId: userQuery.id,
      action: 'member_create',
      targetId: newUser.user.id,
      details: { email, first_name, last_name, role: memberUpdate.role ?? 'member' },
      ip,
    });

    if (skip_email) {
      return NextResponse.json({ success: true, member: memberData, passphrase });
    }

    const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: passphrase,
      options: {
        redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (linkError) {
      return NextResponse.json({ error: "Erreur lors de la génération du lien d'invitation." }, { status: 400 });
    }

    const confirmationUrl =
      linkData?.properties?.action_link ?? `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

    await sendWelcomeEmail({
      to: email,
      firstName: first_name,
      passphrase,
      confirmationUrl,
    });

    return NextResponse.json({ success: true, member: memberData });
  } catch (e) {
    return toApiError(e);
  }
}
