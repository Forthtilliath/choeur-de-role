import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { getUserQuery } from '@/lib/auth';
import { r2, R2_IMAGES_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import { toApiError } from '@/lib/apiError';

const ADMIN_PREFIXES = ['home/', 'gallery/', 'concerts/', 'events/', 'editor/', 'documents/', 'partners/'];

export function isValidKey(key: string, userId: string, isAdmin: boolean): boolean {
  if (!key || key.includes('..') || key.startsWith('/') || key.includes('\0')) return false;

  if (/^members\/[^/]+\.webp$/.test(key)) {
    return key === `members/${userId}.webp` || isAdmin;
  }

  return isAdmin && ADMIN_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export async function POST(request: Request) {
  const userQuery = await getUserQuery();
  if (!userQuery.isLoggedIn) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { key, contentType } = await request.json();
  if (!key || !contentType) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  if (!isValidKey(key, userQuery.id, userQuery.isAdmin)) {
    return NextResponse.json({ error: 'Clé non autorisée' }, { status: 403 });
  }

  try {
    const presignUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({ Bucket: R2_IMAGES_BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 300 },
    );

    return NextResponse.json({ presignUrl, publicUrl: `${R2_PUBLIC_URL}/${key}` });
  } catch (e) {
    return toApiError(e);
  }
}
