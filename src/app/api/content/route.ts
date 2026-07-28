import { NextResponse } from 'next/server';
import { getUserQuery } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

export async function POST(request: Request) {
  const { isAdmin } = await getUserQuery();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  try {
    const { page, block_key, content } = await request.json();

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
      .from('content_blocks')
      .upsert(
        { page, block_key, content, updated_at: new Date().toISOString() },
        { onConflict: 'page,block_key' },
      );

    if (error) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour du contenu.' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return toApiError(e);
  }
}
