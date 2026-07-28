import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/env';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  // Désactive les checksums automatiques — R2 ne supporte pas les paramètres x-amz-checksum-* dans les PUT signés via navigateur
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

export const R2_BUCKET = env.CLOUDFLARE_R2_BUCKET_NAME;
export const R2_IMAGES_BUCKET = env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME;
export const R2_PUBLIC_URL = (env.CLOUDFLARE_R2_PUBLIC_URL ?? '').replace(/\/+$/, '');
