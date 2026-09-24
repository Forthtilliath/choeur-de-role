'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { RichEditor } from '@/components/editor/RichEditorLazy';
import { RepresentationFileManager } from '@/components/features/concerts/admin/RepresentationFileManager';
import { updatePerformanceNotes } from '@/components/features/concerts/clientQueries';
import { Button } from '@/components/ui/Button';

import type { Performance } from '../types';

// Notes et documents partagés de la représentation filtrée
export function PerformancePanel({
  performance,
  onNotesUpdatedAction,
}: {
  performance: Performance;
  onNotesUpdatedAction: (notes: string) => void;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [notes, setNotes] = useState(performance.notes ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSaveNotes() {
    setSaving(true);
    const ok = await updatePerformanceNotes(performance.id, notes || null);
    setSaving(false);
    if (ok) {
      onNotesUpdatedAction(notes);
      toast.success('Notes mises à jour');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-background">
      {/* Notes */}
      <button
        onClick={() => setNotesOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-muted transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-foreground">
          📝 Notes pour les choristes
          {performance.notes && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
              title="Notes existantes"
            />
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-foreground/40 transition-transform ${notesOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {notesOpen && (
        <div className="px-4 pb-4 pt-3 border-t border-border flex flex-col gap-3">
          <RichEditor
            content={notes}
            onChangeAction={setNotes}
            placeholder="Notes visibles par les choristes sur la page répertoire…"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSaveNotes} disabled={saving} loading={saving}>
              Enregistrer
            </Button>
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="border-t border-border">
        <button
          onClick={() => setDocsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-muted transition-colors"
        >
          <span className="font-medium text-foreground">📂 Documents partagés</span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-foreground/40 transition-transform ${docsOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {docsOpen && (
          <div className="px-4 pb-4 pt-3 border-t border-border">
            <RepresentationFileManager performanceId={performance.id} />
          </div>
        )}
      </div>
    </div>
  );
}
