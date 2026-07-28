import { Tables } from '@/types/database';

export type GalleryPhoto = Tables<'gallery_photos'>;
export type GalleryVideo = Tables<'gallery_videos'>;

export type GalleryAlbum = Tables<'gallery_albums'> & {
  gallery_photos: GalleryPhoto[];
  youtube_playlist_url?: string | null;
  gallery_videos: GalleryVideo[];
  performances: { title: string } | null;
};
