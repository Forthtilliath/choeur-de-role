'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';

type Props = {
  editor: Editor;
  onCloseAction: () => void;
};

// Saisie d'URL de lien ; préfixe https:// sauf pour tel:, http:// et mailto:
export function LinkInputBar({ editor, onCloseAction }: Props) {
  const [linkUrl, setLinkUrl] = useState('');

  function handleSetLink() {
    if (!linkUrl) return;

    const url = ['tel:', 'http://', 'mailto:'].some((p) => linkUrl.startsWith(p))
      ? linkUrl
      : `https://${linkUrl}`;

    editor.chain().focus().setLink({ href: url }).run();
    setLinkUrl('');
    onCloseAction();
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-background-secondary shrink-0">
      <input
        type="url"
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSetLink();
          if (e.key === 'Escape') onCloseAction();
        }}
        placeholder="https://..."
        className="flex-1 text-sm border border-border rounded-lg px-3 py-1.5 bg-background"
        autoFocus
      />
      <button
        type="button"
        onClick={handleSetLink}
        className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white"
      >
        OK
      </button>
      <button
        type="button"
        onClick={onCloseAction}
        className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground/60"
      >
        ✕
      </button>
    </div>
  );
}
