import type { Metadata } from 'next';
import { GalerieClient } from '@/components/features/galerie/GalerieClient';

export const metadata: Metadata = {
  title: 'Galerie photos',
  description:
    'Photos des concerts et répétitions du Chœur de Rôle. Revivez nos spectacles en images.',
  alternates: { canonical: 'https://www.choeur-de-role.fr/galerie' },
  openGraph: { url: 'https://www.choeur-de-role.fr/galerie' },
};
import { getGalleryAlbumsQuery } from '@/components/features/galerie/queries';
import { Main } from '@/components/ui/Main';
import { getUserQuery } from '@/lib/auth';
import { sortAlbumPhotos } from '@/utils/galleryHelpers';

export default async function GaleriePage() {
  const { isAdmin: canEdit } = await getUserQuery();
  const albums = await getGalleryAlbumsQuery();
  const sortedAlbums = sortAlbumPhotos(albums);

  return (
    <Main title="Galerie" subtitle="Retrouvez les photos de nos concerts et répétitions.">
      {sortedAlbums.length === 0 && (
        <p className="text-center text-foreground/50 py-12">Aucune photo pour le moment.</p>
      )}

      <GalerieClient albums={sortedAlbums} canEdit={canEdit} />
    </Main>
  );
}
