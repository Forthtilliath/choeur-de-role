export async function nominatimGeocode(
  address: string | null,
  zip: string | null,
  city: string,
): Promise<{ lat: number; lng: number } | null> {
  const query = [address, `${zip ?? ''} ${city}`.trim(), 'France'].filter(Boolean).join(', ');
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'User-Agent': 'ChoeurDeRole/1.0 contact@choeur-de-role.fr' } },
    );
    const json: Array<{ lat: string; lon: string }> = await res.json();
    return json.length ? { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) } : null;
  } catch {
    return null;
  }
}
