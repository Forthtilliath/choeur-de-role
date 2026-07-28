import { env } from '@/env';
import { NextResponse } from 'next/server';
import { MemberInsert } from '@/components/features/trombinoscope';
import { getUserQuery } from '@/lib/auth';
import { logAudit } from '@/lib/auditLog';
import { sendWelcomeEmail } from '@/lib/email';
import { generatePassphrase } from '@/lib/passphrase';
import { createAdminClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

type ImportRow = {
  first_name: string;
  last_name: string;
  email: string;
  voice_part_id?: string | null;
  season_ids?: string[];
  phone?: string | null;
  address?: string | null;
  zip_code?: string | null;
  city?: string | null;
  birthday?: string | null;
};

export type ImportRowResult = {
  first_name: string;
  last_name: string;
  email: string;
  success: boolean;
  passphrase?: string;
  error?: string;
};

export async function POST(request: Request) {
  const userQuery = await getUserQuery();
  if (!userQuery.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const { rows, send_emails } = body as { rows: ImportRow[]; send_emails: boolean };

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'Aucune ligne à importer' }, { status: 400 });
  }

  try {
    const adminSupabase = createAdminClient();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const results: ImportRowResult[] = [];

    for (const row of rows) {
      const { first_name, last_name, email, voice_part_id, season_ids = [], phone, address, zip_code, city, birthday } = row;

      if (!first_name || !last_name || !email) {
        results.push({ first_name, last_name, email, success: false, error: 'Champs requis manquants' });
        continue;
      }

      const passphrase = generatePassphrase(3);

      const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password: passphrase,
        email_confirm: !send_emails,
        phone_confirm: false,
        user_metadata: { first_name, last_name },
      });

      if (authError) {
        results.push({ first_name, last_name, email, success: false, error: 'Erreur lors de la création du compte' });
        continue;
      }

      const memberUpdate: MemberInsert = {
        first_name,
        last_name,
        email,
        voice_part_id: voice_part_id ?? null,
        phone: phone ?? null,
        address: address ?? null,
        zip_code: zip_code ?? null,
        city: city ?? null,
        birthday: birthday ?? null,
      };

      const { error: memberError } = await adminSupabase
        .from('members')
        .update(memberUpdate)
        .eq('id', newUser.user.id);

      if (memberError) {
        results.push({ first_name, last_name, email, success: false, error: 'Erreur lors de la mise à jour du membre' });
        continue;
      }

      if (season_ids.length > 0) {
        await adminSupabase
          .from('member_season')
          .insert(season_ids.map((season_id) => ({ member_id: newUser.user.id, season_id })));
      }

      await logAudit({
        actorId: userQuery.id,
        action: 'member_create',
        targetId: newUser.user.id,
        details: { email, first_name, last_name, role: 'member', source: 'csv_import' },
        ip,
      });

      if (send_emails) {
        const { data: linkData } = await adminSupabase.auth.admin.generateLink({
          type: 'signup',
          email,
          password: passphrase,
          options: { redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
        });
        const confirmationUrl =
          linkData?.properties?.action_link ?? `${env.NEXT_PUBLIC_SITE_URL}/auth/callback`;
        await sendWelcomeEmail({ to: email, firstName: first_name, passphrase, confirmationUrl });
        results.push({ first_name, last_name, email, success: true });
      } else {
        results.push({ first_name, last_name, email, success: true, passphrase });
      }
    }

    return NextResponse.json({ results });
  } catch (e) {
    return toApiError(e);
  }
}
