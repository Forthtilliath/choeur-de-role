import { NextResponse } from 'next/server';
import { sendCandidatureEmails, sendContactEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { createAdminClient } from '@/lib/supabase.server';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { error: 'Trop de tentatives, réessayez dans quelques minutes.' },
      { status: 429 },
    );
  }

  const body = await request.json();
  const { category, first_name, last_name, email, phone, message } = body;

  if (!category || !first_name || !last_name || !email || !message) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('contact_messages')
    .insert({ category, first_name, last_name, email, phone, message });

  if (error) {
    console.error('[contact] DB insert error:', error.message);
    return NextResponse.json({ error: "Erreur lors de l'envoi du message." }, { status: 400 });
  }

  if (category === 'rejoindre') {
    await sendCandidatureEmails({ firstName: first_name, lastName: last_name, email, phone, message });
  } else {
    await sendContactEmail({ category, first_name, last_name, email, phone, message });
  }

  return NextResponse.json({ success: true });
}
