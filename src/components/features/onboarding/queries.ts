import { createServerClient } from '@/lib/supabase.server';
import type { BirthdayVisibility } from '@/components/features/profil/types';

export type MemberForOnboarding = {
  first_name: string | null;
  phone: string | null;
  birthday: string | null;
  address: string | null;
  zip_code: string | null;
  city: string | null;
  photo_url: string | null;
  visibility_email: boolean | null;
  visibility_phone: boolean | null;
  visibility_address: boolean | null;
  visibility_birthday: BirthdayVisibility | null;
  onboarded_at: string | null;
};

export type MemberForAdminOnboarding = {
  first_name: string | null;
  role: string | null;
  admin_onboarded_at: string | null;
};

export type OnboardingPayload = {
  phone?: string;
  address?: string;
  zip_code?: string;
  city?: string;
  birthday?: string;
  visibility_email: boolean;
  visibility_phone: boolean;
  visibility_address: boolean;
  visibility_birthday: BirthdayVisibility;
  onboarded_at: string;
  self_updated_at: string;
};

export async function getMemberForOnboarding(
  userId: string,
): Promise<MemberForOnboarding | null> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('members') as any)
    .select(
      'first_name, phone, birthday, address, zip_code, city, photo_url, visibility_email, visibility_phone, visibility_address, visibility_birthday, onboarded_at',
    )
    .eq('id', userId)
    .single();
  return data as MemberForOnboarding | null;
}

export async function updateMemberOnboarding(
  userId: string,
  payload: OnboardingPayload,
): Promise<boolean> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('members') as any).update(payload).eq('id', userId);
  return !error;
}

export async function getMemberForAdminOnboarding(
  userId: string,
): Promise<MemberForAdminOnboarding | null> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('members') as any)
    .select('first_name, role, admin_onboarded_at')
    .eq('id', userId)
    .single();
  return data as MemberForAdminOnboarding | null;
}

export async function getMemberRoleForOnboarding(userId: string): Promise<string | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.from('members').select('role').eq('id', userId).single();
  return data?.role ?? null;
}

export async function updateAdminOnboarding(userId: string): Promise<boolean> {
  const supabase = await createServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('members') as any)
    .update({ admin_onboarded_at: new Date().toISOString() })
    .eq('id', userId);
  return !error;
}
