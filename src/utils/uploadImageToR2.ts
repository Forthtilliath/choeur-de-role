import type { PublicPresignResponse } from '@forthtilliath/r2';
import { uploadViaPresignedUrl } from '@forthtilliath/r2/client';
import { compressImage } from '@forthtilliath/ts-kit';

// Idem uploadDocToR2, avec compression WebP préalable.
export async function uploadImageToR2(file: File, key: string): Promise<string> {
  const { publicUrl } = await uploadViaPresignedUrl<PublicPresignResponse>({
    file,
    key,
    endpoint: '/api/r2/presign-upload',
    transform: compressImage,
  });
  return publicUrl;
}
