'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createServerClient } from '@/lib/supabase.server';
import { isAdmin } from '@/lib/auth';
import { r2, R2_IMAGES_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import type { MemberRole } from '@/lib/roles';

export async function migratePerformanceImagesToR2(): Promise<{
  migrated: number;
  errors: string[];
}> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { migrated: 0, errors: ['Non authentifié'] };

  const { data: member } = await supabase
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!member || !isAdmin(member.role as MemberRole))
    return { migrated: 0, errors: ['Non autorisé'] };

  const { data: performances, error } = await supabase
    .from('performances')
    .select('id, image_url')
    .like('image_url', '%supabase.co%');

  if (error || !performances) return { migrated: 0, errors: [error?.message ?? 'Erreur de requête'] };
  if (performances.length === 0) return { migrated: 0, errors: [] };

  let migrated = 0;
  const errors: string[] = [];

  for (const perf of performances) {
    if (!perf.image_url) continue;
    try {
      const res = await fetch(perf.image_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentType = res.headers.get('content-type') ?? 'image/jpeg';
      const buffer = Buffer.from(await res.arrayBuffer());

      const urlParts = perf.image_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const key = `concerts/performances/${filename}`;

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_IMAGES_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      const newUrl = `${R2_PUBLIC_URL}/${key}`;

      const { error: updateError } = await supabase
        .from('performances')
        .update({ image_url: newUrl })
        .eq('id', perf.id);

      if (updateError) throw new Error(updateError.message);
      migrated++;
    } catch (err) {
      errors.push(`${perf.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { migrated, errors };
}
