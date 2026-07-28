import { headers } from 'next/headers';
import { AppError } from '@/lib/appError';
import { getUserQuery } from '@/lib/auth';
import { createAdminClient, createServerClient } from '@/lib/supabase.server';
import { logAudit } from '@/lib/auditLog';
import { nominatimGeocode } from '@/utils/geocoding';
import { AdminMember, AdminMemberWithSeasons, TrombiMember } from './types';

export type MemberHistoryEntry = {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  created_at: string;
  actor_name: string | null;
};

type UpdateMemberPayload = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birthday: string | null;
  address: string | null;
  zip_code: string | null;
  city: string | null;
  voice_part_id: string | null;
  role: string;
  bureau_role: string | null;
};

export async function getMemberAuditHistory(memberId: string): Promise<MemberHistoryEntry[]> {
  const admin = createAdminClient();
  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: logs } = await (admin as any)
    .from('audit_logs')
    .select('id, action, details, created_at, user_id')
    .eq('target_id', memberId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (!logs?.length) return [];

  const userIds = [
    ...new Set(
      (logs as { user_id: string | null }[]).map((l) => l.user_id).filter(Boolean),
    ),
  ] as string[];
  const memberMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data } = await supabase
      .from('members')
      .select('id, first_name, last_name')
      .in('id', userIds);
    data?.forEach((m) => memberMap.set(m.id, `${m.first_name} ${m.last_name}`));
  }

  return (logs as Record<string, unknown>[]).map((log) => ({
    id: log.id as string,
    action: log.action as string,
    details: (log.details as Record<string, unknown> | null) ?? null,
    created_at: log.created_at as string,
    actor_name: log.user_id ? (memberMap.get(log.user_id as string) ?? null) : null,
  }));
}

export async function saveMemberAdmin(
  id: string,
  payload: UpdateMemberPayload,
  actorId: string,
): Promise<AdminMember | null> {
  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from('members')
    .select(
      'first_name, last_name, phone, birthday, address, zip_code, city, voice_part_id, role, bureau_role',
    )
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', id)
    .select(`*, voice_parts!members_voice_part_id_fkey (id, name)`)
    .single();

  if (error || !data) return null;

  if (before) {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    for (const key of Object.keys(payload) as (keyof typeof payload)[]) {
      if (before[key] !== payload[key]) {
        changes[key] = { from: before[key], to: payload[key] };
      }
    }
    if (Object.keys(changes).length > 0) {
      const hdrs = await headers();
      const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
      await logAudit({ actorId, action: 'member_update', targetId: id, details: { changes }, ip });
    }
  }

  if (data.city) {
    const coords = await nominatimGeocode(data.address, data.zip_code, data.city);
    if (coords) {
      await supabase.from('members').update({ lat: coords.lat, lng: coords.lng }).eq('id', id);
      return { ...data, lat: coords.lat, lng: coords.lng } as AdminMember;
    }
  }

  return data as AdminMember;
}

export async function getMembersForTrombi(): Promise<TrombiMember[]> {
  const userRoleInfo = await getUserQuery();
  if (!userRoleInfo.isLoggedIn) throw new AppError('UNAUTHORIZED', 'Non connecté');

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('members')
    .select(`*, voice_parts!members_voice_part_id_fkey (id, name, group_name, order_index)`)
    .eq('is_test_account', false)
    .order('last_name');

  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des membres.');

  if (userRoleInfo.isCa) return data;

  return data.map((m) => ({
    ...m,
    email: m.visibility_email ? m.email : null,
    phone: m.visibility_phone ? m.phone : null,
    address: m.visibility_address ? m.address : null,
    zip_code: m.visibility_address ? m.zip_code : null,
    city: m.visibility_address ? m.city : null,
    birthday: m.visibility_birthday === 'none' ? null : m.birthday,
  }));
}

export async function getUsers() {
  const supabase = createAdminClient();
  const { data } = await supabase.auth.admin.listUsers();
  return Object.fromEntries(
    data.users.map((u) => [
      u.id,
      { emailConfirmedAt: u.email_confirmed_at, lastSignInAt: u.last_sign_in_at, isLocked: !!u.banned_until && new Date(u.banned_until) > new Date() },
    ]),
  );
}

export async function getMembersForTrombiAdmin(): Promise<AdminMemberWithSeasons[]> {
  const userRoleInfo = await getUserQuery();
  const supabase = await createServerClient();
  let query = supabase
    .from('members')
    .select(
      `
      *,
      voice_parts!members_voice_part_id_fkey (id, name),
      member_season (season_id)
    `,
    )
    .eq('is_test_account', false)
    .order('last_name');

  if (userRoleInfo.role !== 'super_admin') {
    query = query.neq('role', 'super_admin');
  }

  const { data, error } = await query;
  if (error) throw new AppError('DB_ERROR', 'Erreur lors de la récupération des membres.');
  return data;
}
