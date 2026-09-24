'use client';

import { useState } from 'react';
import { Copy, Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { openSignedUrl } from '@/lib/downloadFile';

import { triggerR2Download } from './repertoireFiles';

type Props = {
  fileUrl: string;
  label: string;
  downloadName: string;
  type: string;
  date: string | null;
  id?: string;
};

export function NonAudioFileRow({ fileUrl, label, downloadName, type, date, id }: Props) {
  const [loading, setLoading] = useState(false);
  const icon = type === 'score' ? '📄' : '📝';

  async function handleOpen() {
    setLoading(true);
    try {
      await openSignedUrl(fileUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'ouvrir le fichier");
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!triggerR2Download(fileUrl, downloadName)) handleOpen();
  }

  async function handleShare() {
    await navigator.clipboard.writeText(`${window.location.origin}/choristes/fichiers/${id}`);
    toast.success('Lien copié !');
  }

  return (
    <div className="rounded-xl border border-border">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="text-lg shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground">{loading ? 'Chargement...' : label}</span>
          {date && <div className="text-xs text-foreground/30 mt-0.5">{date}</div>}
        </div>
        <button
          onClick={handleDownload}
          className="p-1 text-foreground hover:text-primary transition-colors shrink-0"
          title="Télécharger"
          aria-label="Télécharger"
        >
          <Download size={17} />
        </button>
        {id && (
          <button
            onClick={handleShare}
            className="p-1 text-foreground hover:text-primary transition-colors shrink-0"
            title="Copier le lien partageable"
            aria-label="Copier le lien partageable"
          >
            <Copy size={17} />
          </button>
        )}
        <button
          onClick={handleOpen}
          disabled={loading}
          data-testid="open-file-btn"
          className="p-1 text-foreground hover:text-primary transition-colors shrink-0 disabled:opacity-50"
          title="Ouvrir"
          aria-label="Ouvrir"
        >
          <ExternalLink size={17} />
        </button>
      </div>
    </div>
  );
}
