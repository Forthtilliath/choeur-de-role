import type { PublicPresignResponse } from '@forthtilliath/r2';
import { uploadViaPresignedUrl } from '@forthtilliath/r2/client';

// Upload direct navigateur → bucket R2 public, renvoie l'URL publique.
export async function uploadDocToR2(file: File, key: string): Promise<string> {
  const { publicUrl } = await uploadViaPresignedUrl<PublicPresignResponse>({
    file,
    key,
    endpoint: '/api/r2/presign-upload',
  });
  return publicUrl;
}
