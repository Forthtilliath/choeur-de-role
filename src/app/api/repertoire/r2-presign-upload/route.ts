import { createPresignHandler } from '@forthtilliath/r2/server';

import { toApiError } from '@/lib/apiError';
import { getUserQuery } from '@/lib/auth';
import { r2, R2_BUCKET } from '@/lib/r2';

export const POST = createPresignHandler({
  client: r2,
  bucket: R2_BUCKET,
  authorize: async () => {
    const user = await getUserQuery();
    return user.isLoggedIn && user.isAdmin ? null : { status: 403, error: 'Non autorisé' };
  },
  onError: toApiError,
});
