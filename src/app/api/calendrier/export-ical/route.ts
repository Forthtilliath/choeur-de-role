import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { generateIcal } from '@/lib/ical';
import { CalendarEvent } from '@/components/features/calendrier/types';
import { toApiError } from '@/lib/apiError';

export async function GET() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*, event_types (label, color, is_special)')
      .order('starts_at');

    if (error) return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });

    const ical = generateIcal(
      data as CalendarEvent[],
      'Chœur de Rôle',
      'Choeur de Role//Calendrier',
      'choeur-de-role.fr',
    );

    return new NextResponse(ical, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="calendrier-cda.ics"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return toApiError(e);
  }
}
