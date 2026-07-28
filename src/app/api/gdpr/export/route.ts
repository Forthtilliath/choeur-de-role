import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { getMemberGdprData } from '@/components/features/gdpr/queries';
import { toApiError } from '@/lib/apiError';

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const exportData = await getMemberGdprData(user.id);

    const filename = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    return toApiError(e);
  }
}
