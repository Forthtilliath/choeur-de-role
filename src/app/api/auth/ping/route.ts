import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({}, { status: 401 });

  try {
    await supabase
      .from('members')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({});
  } catch (e) {
    return toApiError(e);
  }
}
