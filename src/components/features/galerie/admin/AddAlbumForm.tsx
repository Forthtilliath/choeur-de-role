'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function AddAlbumForm({
  onSaveAction,
  onCancelAction,
}: {
  onSaveAction: (title: string) => void;
  onCancelAction: () => void;
}) {
  const [title, setTitle] = useState('');

  return (
    <div className="flex items-center gap-3 max-w-sm mx-auto">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) onSaveAction(title.trim()); }}
        placeholder="Nom de l'album..."
        className="flex-1 text-sm bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
      />
      <Button size="sm" onClick={() => { if (title.trim()) onSaveAction(title.trim()); }}>
        Créer
      </Button>
      <Button size="sm" variant="ghost" onClick={onCancelAction}>
        Annuler
      </Button>
    </div>
  );
}