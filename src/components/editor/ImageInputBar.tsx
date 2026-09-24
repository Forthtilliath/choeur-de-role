'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';

import { cn } from '@/lib/utils';

import { uploadEditorImage } from './uploadEditorImage';

type Props = {
  editor: Editor;
  onCloseAction: () => void;
};

// Insertion d'image : upload depuis l'appareil ou URL externe
export function ImageInputBar({ editor, onCloseAction }: Props) {
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  function handleSetImage() {
    if (!imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    onCloseAction();
  }

  const modeClass = (mode: 'upload' | 'url') =>
    `text-xs px-2.5 py-1 rounded-md transition-colors ${imageMode === mode ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/50 hover:text-foreground'}`;

  return (
    <div className="flex flex-col gap-2 px-3 py-2 border-b border-border bg-background-secondary shrink-0">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setImageMode('upload')}
          className={modeClass('upload')}
        >
          Depuis l&apos;appareil
        </button>
        <button type="button" onClick={() => setImageMode('url')} className={modeClass('url')}>
          URL externe
        </button>
        <button
          type="button"
          onClick={onCloseAction}
          className="ml-auto text-xs px-2.5 py-1 rounded-lg border border-border text-foreground/60 hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      {imageMode === 'upload' ? (
        <label
          className={cn(
            'flex items-center justify-center text-xs px-3 py-3 rounded-lg border border-dashed border-border text-foreground/60 cursor-pointer hover:border-primary/50 hover:text-primary transition-colors',
            imageUploading && 'opacity-50 cursor-not-allowed pointer-events-none',
          )}
        >
          {imageUploading ? 'Envoi en cours...' : 'Cliquer pour choisir une image'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={imageUploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImageUploading(true);
              const url = await uploadEditorImage(file);
              setImageUploading(false);
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
                onCloseAction();
              }
            }}
          />
        </label>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSetImage();
              if (e.key === 'Escape') onCloseAction();
            }}
            placeholder="https://..."
            className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-background"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSetImage}
            className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
