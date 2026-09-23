import { createR2Client } from '@forthtilliath/r2/server';

import { env } from '@/env';

export const r2 = createR2Client({
  endpoint: env.CLOUDFLARE_R2_ENDPOINT,
  accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
});

export const R2_BUCKET = env.CLOUDFLARE_R2_BUCKET_NAME;
export const R2_IMAGES_BUCKET = env.CLOUDFLARE_R2_IMAGES_BUCKET_NAME;
export const R2_PUBLIC_URL = (env.CLOUDFLARE_R2_PUBLIC_URL ?? '').replace(/\/+$/, '');
