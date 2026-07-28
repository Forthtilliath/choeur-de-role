'use server';

import { createServerClient } from '@/lib/supabase.server';
import { nominatimGeocode } from '@/utils/geocoding';
import type { BirthdayVisibility } from './types';

type SaveProfilePayload = {
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
};

export async function saveProfile(memberId: string, payload: SaveProfilePayload): Promise<boolean> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== memberId) return false;

  let { lat, lng } = payload;
  if ((lat === null || lng === null) && payload.city) {
    const coords = await nominatimGeocode(payload.address, payload.zip_code, payload.city);
    lat = coords?.lat ?? null;
    lng = coords?.lng ?? null;
  }

  const { error } = await supabase
    .from('members')
    .update({ ...payload, lat, lng, self_updated_at: new Date().toISOString() })
    .eq('id', memberId);

  return !error;
}
