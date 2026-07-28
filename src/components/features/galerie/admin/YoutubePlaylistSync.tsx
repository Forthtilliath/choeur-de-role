'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
  albumId: string;
  currentUrl: string;
  videoCount: number;
  onSyncAction: () => void;
};

export function YoutubePlaylistSync({
  albumId,
  currentUrl,
  videoCount,
  onSyncAction,
}: Props) {
  const [url, setUrl] = useState(currentUrl);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  async function handleSync() {
    if (!url.trim()) return;
    setSyncing(true);
    setError('');

    const res = await fetch('/api/galerie/sync-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumId, playlistUrl: url }),
    });

    if (res.ok) {
      onSyncAction();
      toast.success('Playlist synchronisée');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la synchronisation');
      toast.error('Erreur lors de la synchronisation YouTube');
    }

    setSyncing(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-foreground/50">
        Playlist YouTube <span className="text-foreground/30">(optionnel)</span>
      </label>

      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/playlist?list=PL..."
          className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
        />
        <button
          onClick={handleSync}
          disabled={syncing || !url.trim()}
          className="px-3 py-2 rounded-lg border border-border text-sm text-foreground/60 hover:border-primary hover:text-primary transition-all disabled:opacity-40 shrink-0 flex items-center gap-1.5"
        >
          {syncing ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Sync...
            </>
          ) : (
            '🔄 Sync'
          )}
        </button>
      </div>

      {videoCount > 0 && !syncing && (
        <p className="text-xs text-foreground/40">
          {videoCount} vidéo{videoCount > 1 ? 's' : ''} synchronisée{videoCount > 1 ? 's' : ''}
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <p className="text-xs text-foreground/30">
        ⚠️ Une nouvelle synchronisation remplace toutes les vidéos existantes de l&apos;album.
      </p>
    </div>
  );
}
