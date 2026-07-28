import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';
import { r2, R2_BUCKET } from '@/lib/r2';
import { getUserQuery } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getUserQuery();
  if (!user.isLoggedIn || !user.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { key, contentType } = await request.json();
  if (!key || !contentType) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const url = await getSignedUrl(
    r2,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 300 }, // 5 minutes pour uploader
  );

  return NextResponse.json({ url });
}
