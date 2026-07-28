import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { r2, R2_BUCKET } from '@/lib/r2';
import { createServerClient } from '@/lib/supabase.server';
import { toApiError } from '@/lib/apiError';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  try {
    if (path.startsWith('r2://')) {
      const key = path.slice(5);
      const url = await getSignedUrl(
        r2,
        new GetObjectCommand({ Bucket: R2_BUCKET, Key: key, ResponseContentDisposition: 'inline' }),
        { expiresIn: 3600 },
      );
      return NextResponse.json({ url });
    }

    const urlParts = path.split('/repertoire/');
    const filePath = urlParts[urlParts.length - 1];
    const { data, error } = await supabase.storage
      .from('repertoire')
      .createSignedUrl(filePath, 3600, { download: false });
    if (error) return NextResponse.json({ error: 'Erreur lors de la génération du lien de téléchargement.' }, { status: 400 });

    return NextResponse.json({ url: data.signedUrl });
  } catch (e) {
    return toApiError(e);
  }
}
