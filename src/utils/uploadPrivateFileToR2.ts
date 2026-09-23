import { uploadViaPresignedUrl } from '@forthtilliath/r2/client';

// Upload direct navigateur → bucket R2 privé (audio, partitions…).
// Le fichier ne transite pas par Vercel, qui refuse les corps de requête > 4,5 Mo.
export async function uploadPrivateFileToR2(file: File, key: string): Promise<void> {
  await uploadViaPresignedUrl({ file, key, endpoint: '/api/repertoire/r2-presign-upload' });
}
