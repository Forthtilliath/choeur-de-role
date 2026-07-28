import { getPerformancesTitleQuery } from '@/components/features/concerts';
import { GalerieAdminClient } from '@/components/features/galerie/GalerieAdminClient';
import { getGalleryAlbumsAdminQuery } from '@/components/features/galerie/queries';
import { Main } from '@/components/ui/Main';
import { handlePageAccess, isAdmin } from '@/lib/auth';
import { sortAlbumPhotos } from '@/utils/galleryHelpers';

export default async function GalerieAdminPage() {
  await handlePageAccess(isAdmin);
  const [albums, performances] = await Promise.all([
    getGalleryAlbumsAdminQuery(),
    getPerformancesTitleQuery(),
  ]);
  const sortedAlbums = sortAlbumPhotos(albums);

  return (
    <Main
      variant="admin"
      title="Galerie — Administration"
      subtitle="Gérez les albums et les photos."
      breadcrumbs={[{ label: 'Galerie', href: '/galerie' }]}
      breadcrumbCurrent="Administration"
    >
      <GalerieAdminClient initialAlbums={sortedAlbums} performances={performances} />
    </Main>
  );
}
