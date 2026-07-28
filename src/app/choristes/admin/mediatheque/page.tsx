import { getPerformancesWithSeasons } from '@/components/features/concerts';
import { getVoiceParts } from '@/components/features/pupitres/queries';
import { MediathequeAdminClient } from '@/components/features/repertoire/admin/MediathequeAdminClient';
import { getSongsWithFiles } from '@/components/features/repertoire/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';

export default async function AdminMediathequePage() {
  await handlePageAccess(isAdmin);

  const [songs, voiceParts, performances] = await Promise.all([
    getSongsWithFiles(),
    getVoiceParts(),
    getPerformancesWithSeasons(),
  ]);

  return (
    <Main variant="admin" title="Médiathèque" breadcrumbs={[{ label: 'Répertoire', href: '/choristes/repertoire' }]}
      breadcrumbCurrent="Administration">
      <MediathequeAdminClient
        initialSongs={songs}
        voiceParts={voiceParts}
        performances={performances}
      />
    </Main>
  );
}
