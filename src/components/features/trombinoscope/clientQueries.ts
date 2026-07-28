import { createClient } from '@/lib/supabase.client';
import { AdminMember } from './types';

export async function deleteMember(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('members').delete().eq('id', id);
  return !error;
}

export async function updateMember(
  id: string,
  payload: {
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
  },
): Promise<AdminMember | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('members')
    .update(payload)
    .eq('id', id)
    .select(`*, voice_parts!members_voice_part_id_fkey (id, name)`)
    .single();
  if (error) return null;
  return data as AdminMember;
}

export async function updateMemberEmail(memberId: string, email: string): Promise<boolean> {
  const res = await fetch('/api/admin/update-member-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, email }),
  });
  return res.ok;
}

export async function resendInvite(memberId: string): Promise<boolean> {
  const res = await fetch('/api/admin/resend-invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId }),
  });
  return res.ok;
}

export async function resetMemberPassword(memberId: string): Promise<boolean> {
  const res = await fetch('/api/admin/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId }),
  });
  return res.ok;
}

export async function resetAllMembersPasswords(): Promise<number | null> {
  const res = await fetch('/api/admin/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ all: true }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.count ?? null;
}

export async function addMemberSeason(memberId: string, seasonId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('member_season')
    .upsert({ member_id: memberId, season_id: seasonId }, { onConflict: 'member_id,season_id' });
  return !error;
}

export async function removeMemberSeason(memberId: string, seasonId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('member_season')
    .delete()
    .eq('member_id', memberId)
    .eq('season_id', seasonId);
  return !error;
}

export async function bulkAssignSeason(memberIds: string[], seasonId: string): Promise<boolean> {
  const supabase = createClient();
  const rows = memberIds.map((member_id) => ({ member_id, season_id: seasonId }));
  const { error } = await supabase
    .from('member_season')
    .upsert(rows, { onConflict: 'member_id,season_id' });
  return !error;
}

export async function toggleMemberLock(memberId: string, lock: boolean): Promise<boolean> {
  const res = await fetch('/api/admin/toggle-member-lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberId, lock }),
  });
  return res.ok;
}
