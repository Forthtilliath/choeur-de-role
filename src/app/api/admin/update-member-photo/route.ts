import { NextResponse } from 'next/server';
import { createAdminClient, createServerClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { data: caller } = await supabase
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!['admin', 'super_admin'].includes(caller?.role ?? '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { memberId, photoUrl } = await request.json();
  if (!memberId || !photoUrl) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin
      .from('members')
      .update({ photo_url: photoUrl })
      .eq('id', memberId);

    if (error) return NextResponse.json({ error: 'Erreur lors de la mise à jour de la photo.' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return toApiError(e);
  }
}
