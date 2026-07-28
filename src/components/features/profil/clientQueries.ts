import { createClient } from '@/lib/supabase.client';
import { uploadImageToR2 } from '@/utils/uploadImageToR2';
import { BirthdayVisibility } from './types';

export async function uploadProfilePhoto(memberId: string, file: File): Promise<string | null> {
  const supabase = createClient();
  try {
    const publicUrl = await uploadImageToR2(file, `members/${memberId}.webp`);
    const url = `${publicUrl}?t=${Date.now()}`;
    await supabase.from('members').update({ photo_url: publicUrl }).eq('id', memberId);
    return url;
  } catch {
    return null;
  }
}

export async function updateProfile(
  memberId: string,
  payload: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address: string | null;
    zip_code: string | null;
    city: string | null;
    birthday: string | null;
    lat: number | null;
    lng: number | null;
    visibility_email: boolean;
    visibility_phone: boolean;
    visibility_address: boolean;
    visibility_birthday: BirthdayVisibility;
  },
): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('members')
    .update({ ...payload, self_updated_at: new Date().toISOString() })
    .eq('id', memberId);
  return !error;
}

export async function geocodeAddress(
  address: string,
  zip: string,
  city: string,
): Promise<{ lat: number; lng: number } | null> {
  const res = await fetch(
    `/api/geocode?address=${encodeURIComponent(address)}&zip=${encodeURIComponent(zip)}&city=${encodeURIComponent(city)}`,
  );
  if (!res.ok) return null;
  return res.json();
}
