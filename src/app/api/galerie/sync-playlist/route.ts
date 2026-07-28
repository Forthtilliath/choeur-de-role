import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase.server';
import { env } from '@/env';
import { getMemberRole } from '@/components/features/membres/queries';
import { syncPlaylistVideos } from '@/components/features/galerie/queries';

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const role = await getMemberRole(user.id);
  if (!['admin', 'super_admin'].includes(role ?? '')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { albumId, playlistUrl } = await request.json();
  if (!albumId || !playlistUrl) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
  }

  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) {
    return NextResponse.json({ error: 'URL de playlist invalide' }, { status: 400 });
  }

  const apiKey = env.YOUTUBE_API_KEY;

  try {
    const videos = await fetchPlaylistVideos(playlistId, apiKey);
    await syncPlaylistVideos(albumId, videos, playlistUrl);
    return NextResponse.json({ success: true, count: videos.length });
  } catch (err) {
    console.error('[sync-playlist]', err);
    return NextResponse.json({ error: 'Erreur lors de la synchronisation' }, { status: 500 });
  }
}

function extractPlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('list');
  } catch {
    return null;
  }
}

type YoutubeVideo = {
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
};

async function fetchPlaylistVideos(playlistId: string, apiKey: string): Promise<YoutubeVideo[]> {
  const videos: YoutubeVideo[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', apiKey);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.error) throw new Error(data.error.message);

    for (const item of data.items ?? []) {
      const snippet = item.snippet;
      const videoId = snippet?.resourceId?.videoId;
      if (!videoId) continue;

      videos.push({
        youtubeId: videoId,
        title: snippet.title ?? '',
        thumbnailUrl:
          snippet.thumbnails?.medium?.url ??
          snippet.thumbnails?.default?.url ??
          `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      });
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return videos;
}
