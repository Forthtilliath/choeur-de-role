'use client';

import { useState } from 'react';

import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';

export function AddBlockForm({
  onSave,
  onCancel,
}: {
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState('<h2>Nouveau bloc</h2><p>Votre contenu ici...</p>');

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary text-left">
      <h3 className="text-base font-medium mb-4 text-foreground">Nouveau bloc</h3>
      <RichEditor content={content} onChangeAction={setContent} placeholder="Contenu du bloc..." />
      <div className="flex gap-3 justify-end mt-4">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={() => onSave(content)}>Ajouter</Button>
      </div>
    </div>
  );
}
