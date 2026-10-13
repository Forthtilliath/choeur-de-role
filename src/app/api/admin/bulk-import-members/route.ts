import { NextResponse } from 'next/server';

import type { MemberInsert } from '@/components/features/trombinoscope';
import { env } from '@/env';
import { toApiError } from '@/lib/apiError';
import { logAudit } from '@/lib/auditLog';
import { getUserQuery } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { bulkImportSchema, importRowSchema, MAX_IMPORT_ROWS } from '@/lib/memberSchemas';
import { generatePassword } from '@/lib/password';
import { createAdminClient } from '@/lib/supabase.server';

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

  const parsed = bulkImportSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: `Entre 1 et ${MAX_IMPORT_ROWS} lignes à importer par envoi.` },
      { status: 400 },
    );
  }
  const { rows, send_emails } = parsed.data;

  try {
    const adminSupabase = createAdminClient();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const results: ImportRowResult[] = [];

    for (const rawRow of rows) {
      const row = importRowSchema.safeParse(rawRow);
      if (!row.success) {
        // Ligne signalée telle que reçue, pour que l'admin la retrouve dans son fichier
        const raw = (rawRow ?? {}) as Record<string, unknown>;
        results.push({
          first_name: String(raw.first_name ?? ''),
          last_name: String(raw.last_name ?? ''),
          email: String(raw.email ?? ''),
          success: false,
          error: 'Ligne invalide : prénom, nom et e-mail valide requis',
        });
        continue;
      }
      const {
        first_name,
        last_name,
        email,
        voice_part_id,
        season_ids,
        phone,
        address,
        zip_code,
        city,
        birthday,
      } = row.data;

      const passphrase = generatePassword();

      const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password: passphrase,
        email_confirm: !send_emails,
        phone_confirm: false,
        user_metadata: { first_name, last_name },
      });

      if (authError) {
        results.push({
          first_name,
          last_name,
          email,
          success: false,
          error: 'Erreur lors de la création du compte',
        });
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
        results.push({
          first_name,
          last_name,
          email,
          success: false,
          error: 'Erreur lors de la mise à jour du membre',
        });
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
