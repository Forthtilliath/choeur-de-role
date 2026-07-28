import { Suspense } from 'react';
import { getVoiceParts } from '@/components/features/pupitres/queries';
import { getMembersForTrombi } from '@/components/features/trombinoscope/queries';
import { TrombinoscopeClient } from '@/components/features/trombinoscope/TrombinoscopeClient';
import { handlePageAccess } from '@/lib/auth';

export default async function TrombinoscopePage() {
  await handlePageAccess();
  const [members, voiceParts] = await Promise.all([getMembersForTrombi(), getVoiceParts()]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <Suspense>
        <TrombinoscopeClient members={members} voiceParts={voiceParts} />
      </Suspense>
    </main>
  );
}
