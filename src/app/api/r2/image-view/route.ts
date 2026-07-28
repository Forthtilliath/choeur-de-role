import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

const ALLOWED_PATTERNS = [/\.supabase\.co$/, /\.r2\.dev$/];

const EXT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
};

function contentTypeFromUrl(url: string): string | null {
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  return EXT_TYPES[ext ?? ''] ?? null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return new NextResponse('Missing url', { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse('URL invalide', { status: 400 });
  }

  if (!ALLOWED_PATTERNS.some((p) => p.test(parsed.hostname))) {
    return new NextResponse('Domaine non autorisé', { status: 403 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Non autorisé', { status: 401 });

  try {
    const res = await fetch(url);
    if (!res.ok) return new NextResponse('Image introuvable', { status: 404 });

    const contentType = contentTypeFromUrl(url) ?? res.headers.get('content-type') ?? 'image/jpeg';

    return new NextResponse(res.body as ReadableStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (e) {
    return toApiError(e);
  }
}
