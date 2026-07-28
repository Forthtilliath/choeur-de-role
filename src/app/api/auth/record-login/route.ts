import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { logAudit } from '@/lib/auditLog';
import { sendSuspiciousLoginEmail } from '@/lib/email';
import {
  getMemberForLoginAlert,
  getAdminEmails,
  getLastLoginCountry,
} from '@/components/features/membres/queries';
import { toApiError } from '@/lib/apiError';

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({}, { status: 401 });

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const countryCode = request.headers.get('x-vercel-ip-country') ?? null;
    const city = request.headers.get('x-vercel-ip-city') ?? null;
    const country = countryCode ? countryName(countryCode) : null;

    const previousCountry = await getLastLoginCountry(user.id);

    if (country && previousCountry && country !== previousCountry) {
      const [member, adminEmails] = await Promise.all([
        getMemberForLoginAlert(user.id),
        getAdminEmails(),
      ]);

      if (member && adminEmails.length > 0) {
        await sendSuspiciousLoginEmail({
          adminEmails,
          memberName: `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim(),
          memberEmail: member.email ?? '',
          previousCountry,
          newCountry: country,
          city: city ?? undefined,
          ip: ip ?? undefined,
        });
      }
    }

    await logAudit({
      actorId: user.id,
      action: 'member_login',
      details: { country, city, ip },
      ip,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return toApiError(e);
  }
}
