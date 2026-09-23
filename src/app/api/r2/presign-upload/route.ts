import { createPresignHandler, isSafeKey } from '@forthtilliath/r2/server';

import { toApiError } from '@/lib/apiError';
import { getUserQuery } from '@/lib/auth';
import { r2, R2_IMAGES_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';

const ADMIN_PREFIXES = [
  'home/',
  'gallery/',
  'concerts/',
  'events/',
  'editor/',
  'documents/',
  'partners/',
];

export function isValidKey(key: string, userId: string, isAdmin: boolean): boolean {
  if (!isSafeKey(key)) return false;

  if (/^members\/[^/]+\.webp$/.test(key)) {
    return key === `members/${userId}.webp` || isAdmin;
  }

  return isAdmin && ADMIN_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export const POST = createPresignHandler({
  client: r2,
  bucket: R2_IMAGES_BUCKET,
  publicBaseUrl: R2_PUBLIC_URL,
  authorize: async (key) => {
    const user = await getUserQuery();
    if (!user.isLoggedIn) return { status: 401, error: 'Non autorisé' };
    if (!isValidKey(key, user.id, user.isAdmin)) return { status: 403, error: 'Clé non autorisée' };
    return null;
  },
  onError: toApiError,
});
