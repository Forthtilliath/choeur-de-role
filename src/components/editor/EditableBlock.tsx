'use client';

import { useState } from 'react';
import { RichEditor } from '@/components/editor/RichEditor';
import { Button } from '@/components/ui/Button';

type Props = {
  content: string;
  canEdit: boolean;
  onSaveAction: (content: string) => Promise<void>;
  children: React.ReactNode;
};

export function EditableBlock({ content, canEdit, onSaveAction, children }: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSaveAction(value);
    setSaving(false);
    setEditing(false);
  }

  if (!canEdit) return <>{children}</>;

  return (
    <div className="relative group">
      {!editing && (
        <>
          {children}
          <button
            onClick={() => setEditing(true)}
            className="absolute top-2 right-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-md bg-primary text-white"
          >
            ✏️ Modifier
          </button>
        </>
      )}

      {editing && (
        <div>
          <RichEditor content={value} onChangeAction={setValue} />
          <div className="flex gap-2 mt-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}