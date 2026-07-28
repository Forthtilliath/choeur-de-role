import { GalleryAlbum } from '@/components/features/galerie';
import { sortByOrderIndex } from '@/utils/arrayHelpers';

export function sortAlbumPhotos(albums: GalleryAlbum[]): GalleryAlbum[] {
  return albums.map((album) => ({
    ...album,
    gallery_photos: sortByOrderIndex(album.gallery_photos),
  }));
}
