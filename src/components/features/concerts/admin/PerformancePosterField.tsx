import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  preview: string;
  onFileChangeAction: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAction: () => void;
};

// Affiche portrait : bouton d'upload et aperçu (blob local ou image R2 ouvrable en plein écran)
export function PerformancePosterField({ preview, onFileChangeAction, onRemoveAction }: Props) {
  return (
    <div className="flex gap-4 items-end">
      <div className="flex flex-col gap-2 flex-1">
        <span className="text-sm font-medium text-foreground">
          Affiche <span className="text-foreground/40 font-normal">(portrait recommandé)</span>
        </span>
        <label aria-label="Ajouter une affiche" className="cursor-pointer self-start">
          <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm text-foreground/60 hover:border-primary hover:text-primary transition-all bg-background">
            <span>📷</span>
            <span>{preview ? "Changer l'affiche" : 'Ajouter une affiche'}</span>
          </div>
          <input type="file" accept="image/*" onChange={onFileChangeAction} className="hidden" />
        </label>
      </div>
      {preview ? (
        <div className="relative shrink-0 w-16 h-24 border border-border rounded-lg overflow-hidden bg-background">
          <Image
            src={preview}
            alt="Preview"
            fill
            sizes="64px"
            className="object-cover"
            unoptimized={preview.startsWith('blob:')}
          />
          {!preview.startsWith('blob:') && (
            <Link
              href={`/api/r2/image-view?url=${encodeURIComponent(preview)}`}
              target="_blank"
              className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              title="Ouvrir en plein écran"
            >
              <ExternalLink size={10} />
            </Link>
          )}
          <button
            type="button"
            onClick={onRemoveAction}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="shrink-0 w-16 h-24 border border-dashed border-border rounded-lg bg-background-secondary flex items-center justify-center">
          <span className="text-foreground/20 text-2xl">🎵</span>
        </div>
      )}
    </div>
  );
}
