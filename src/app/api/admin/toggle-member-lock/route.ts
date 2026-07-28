import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/auditLog';
import { createAdminClient, createServerClient } from '@/lib/supabase.server';
import { getMemberRole } from '@/components/features/membres/queries';
import { toApiError } from '@/lib/apiError';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const role = await getMemberRole(user.id);
  if (!role || !['admin', 'super_admin'].includes(role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { memberId, lock } = await request.json();
  if (!memberId || typeof lock !== 'boolean') {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  }
  if (memberId === user.id) {
    return NextResponse.json({ error: 'Impossible de se verrouiller soi-même' }, { status: 400 });
  }

  const targetRole = await getMemberRole(memberId);
  if (targetRole === 'super_admin') {
    return NextResponse.json({ error: 'Impossible de verrouiller un super admin' }, { status: 403 });
  }

  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(memberId, {
      ban_duration: lock ? '876000h' : 'none',
    });

    if (error) return NextResponse.json({ error: 'Erreur lors de la modification du statut du compte.' }, { status: 500 });

    await logAudit({
      actorId: user.id,
      action: lock ? 'member_locked' : 'member_unlocked',
      targetId: memberId,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return toApiError(e);
  }
}
