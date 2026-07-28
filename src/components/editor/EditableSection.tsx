'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { RichEditor } from '@/components/editor/RichEditor';
import { Button } from '@/components/ui/Button';

type Props = {
  page: string;
  blockKey: string;
  initialContent: string;
  canEdit: boolean;
  dark?: boolean;
  onSaveOverrideAction?: (content: string) => Promise<void> | void;
};

export function EditableSection({
  page,
  blockKey,
  initialContent,
  canEdit,
  dark,
  onSaveOverrideAction,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [value, setValue] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  // Refs to always-current callbacks for keyboard shortcuts
  const handleSaveRef = useRef<() => void>(() => {});
  const cancelRef = useRef<() => void>(() => {});
  useEffect(() => {
    handleSaveRef.current = handleSave;
    cancelRef.current = () => { setEditing(false); setValue(content); };
  });

  useEffect(() => {
    if (!editing) return;
    function onCmdEnter(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleSaveRef.current();
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      const active = document.activeElement;
      if (active instanceof HTMLInputElement && active.type === 'url') return;
      cancelRef.current();
    }
    document.addEventListener('keydown', onCmdEnter, true);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('keydown', onCmdEnter, true);
      document.removeEventListener('keydown', onEscape);
    };
  }, [editing]);

  async function handleSave() {
    setSaving(true);
    try {
      if (onSaveOverrideAction) {
        await onSaveOverrideAction(value);
      } else {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ page, block_key: blockKey, content: value }),
        });
        if (!res.ok) throw new Error();
      }
      setContent(value);
      setEditing(false);
      toast.success('Contenu sauvegardé');
    } catch {
      toast.error('Erreur lors de la sauvegarde', {
        description: 'Vérifiez votre connexion et réessayez.',
      });
    }
    setSaving(false);
  }

  return (
    <div className="relative group">
      {!editing ? (
        <>
          <div className="mdx-content" dangerouslySetInnerHTML={{ __html: content }} />
          {canEdit && (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-0 right-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity text-xs px-2 py-1 rounded-md bg-primary text-white"
            >
              ✏️ Modifier
            </button>
          )}
        </>
      ) : (
        <div>
          <RichEditor content={value} onChangeAction={setValue} dark={dark} />
          <div className="flex gap-2 mt-3 justify-end">
            <Button
              variant={dark ? 'ghost-white' : 'ghost'}
              size="sm"
              onClick={() => {
                setEditing(false);
                setValue(content);
              }}
            >
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
