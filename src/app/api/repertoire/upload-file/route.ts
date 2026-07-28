import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { r2, R2_BUCKET } from '@/lib/r2';
import { getUserQuery } from '@/lib/auth';

export const maxDuration = 60;

export async function POST(request: Request) {
  const user = await getUserQuery();
  if (!user.isLoggedIn || !user.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const key = formData.get('key') as string | null;

  if (!file || !key) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  if (key.includes('..') || key.startsWith('/') || key.includes('\0')) {
    return NextResponse.json({ error: 'Clé invalide' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    }),
  );

  return NextResponse.json({ success: true });
}
