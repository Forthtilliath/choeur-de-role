import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') ?? '';
  const zip = searchParams.get('zip') ?? '';
  const city = searchParams.get('city') ?? '';

  if (!city && !zip) return NextResponse.json(null);

  const query = [address, `${zip} ${city}`.trim(), 'France'].filter(Boolean).join(', ');

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'ChoeurDeRole/1.0 contact@choeur-de-role.fr' } },
    );
    const data = await res.json();
    if (data.length > 0) {
      return NextResponse.json({
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      });
    }
  } catch (err) {
    console.error('[geocode]', err);
  }

  return NextResponse.json(null);
}
