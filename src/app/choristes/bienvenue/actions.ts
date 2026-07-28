'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase.server';
import { updateMemberOnboarding } from '@/components/features/onboarding/queries';
import type { BirthdayVisibility } from '@/components/features/profil/types';
import type { OnboardingPayload } from '@/components/features/onboarding/queries';

export type OnboardingProfileData = {
  phone: string | null;
  address: string | null;
  zip_code: string | null;
  city: string | null;
  birthday: string | null;
  visibility_email: boolean;
  visibility_phone: boolean;
  visibility_address: boolean;
  visibility_birthday: BirthdayVisibility;
};

export async function completeOnboarding(profileData: OnboardingProfileData): Promise<boolean> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const payload: OnboardingPayload = {
    visibility_email: profileData.visibility_email,
    visibility_phone: profileData.visibility_phone,
    visibility_address: profileData.visibility_address,
    visibility_birthday: profileData.visibility_birthday,
    onboarded_at: new Date().toISOString(),
    self_updated_at: new Date().toISOString(),
  };
  if (profileData.phone) payload.phone = profileData.phone;
  if (profileData.address) payload.address = profileData.address;
  if (profileData.zip_code) payload.zip_code = profileData.zip_code;
  if (profileData.city) payload.city = profileData.city;
  if (profileData.birthday) payload.birthday = profileData.birthday;

  const ok = await updateMemberOnboarding(user.id, payload);
  if (!ok) return false;

  const cookieStore = await cookies();
  cookieStore.set('mbr_onboarded', '1', {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  return true;
}
