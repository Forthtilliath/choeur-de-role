import { GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { r2, R2_BUCKET } from '@/lib/r2';
import { createServerClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const filename = searchParams.get('filename') || 'audio';

  if (!path || !path.startsWith('r2://')) {
    return NextResponse.json({ error: 'Paramètre invalide' }, { status: 400 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    const key = path.slice(5);
    const response = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));

    if (!response.Body) {
      return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
    }

    return new NextResponse(response.Body as ReadableStream, {
      headers: {
        'Content-Type': response.ContentType ?? 'audio/mpeg',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        ...(response.ContentLength && { 'Content-Length': response.ContentLength.toString() }),
      },
    });
  } catch (e) {
    return toApiError(e);
  }
}
