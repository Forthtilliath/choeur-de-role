import { AppError } from '@/lib/appError';
import { createServerClient } from '@/lib/supabase.server';
import { GalleryAlbum } from './types';

export async function getGalleryLastUpdated(): Promise<Date> {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('gallery_albums')
    .select('updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false })
    .limit(1);
  return data?.[0]?.updated_at ? new Date(data[0].updated_at) : new Date();
}

type YoutubeVideoRow = {
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
};

export async function syncPlaylistVideos(
  albumId: string,
  videos: YoutubeVideoRow[],
  playlistUrl: string,
): Promise<void> {
  const supabase = await createServerClient();
  await supabase.from('gallery_videos').delete().eq('album_id', albumId);
  if (videos.length > 0) {
    await supabase.from('gallery_videos').insert(
      videos.map((v, i) => ({
        album_id: albumId,
        youtube_id: v.youtubeId,
        title: v.title,
        thumbnail_url: v.thumbnailUrl,
        order_index: i,
      })),
    );
  }
  await supabase
    .from('gallery_albums')
    .update({ youtube_playlist_url: playlistUrl, album_type: 'videos' })
    .eq('id', albumId);
}

export async function getGalleryAlbumsQuery(): Promise<GalleryAlbum[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('gallery_albums')
    .select(
      `
      *,
      gallery_photos (*),
      gallery_videos (*),
      performances!performance_id (title)
    `,
    )
    .eq('published', true)
    .order('order_index');

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des albums.');
  }
  return data;
}

export async function getGalleryAlbumsAdminQuery(): Promise<GalleryAlbum[]> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('gallery_albums')
    .select(
      `
      *,
      gallery_photos (*),
      gallery_videos (*),
      performances!performance_id (title)
    `,
    )
    .order('order_index');

  if (error) {
    throw new AppError('DB_ERROR', 'Erreur lors de la récupération des albums.');
  }
  return data;
}
