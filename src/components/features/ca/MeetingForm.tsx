'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';
import { upsertMeeting } from './clientQueries';
import { CaMeeting } from './types';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';

export function MeetingForm({
  meeting,
  onCloseAction,
  onSaveAction,
}: {
  meeting: CaMeeting | null;
  onCloseAction: () => void;
  onSaveAction: (meeting: CaMeeting) => void;
}) {
  const [title, setTitle] = useState(meeting?.title ?? '');
  const [meetingDate, setMeetingDate] = useState(meeting?.meeting_date ?? '');
  const [content, setContent] = useState(meeting?.content ?? '');
  const [pdfUrl, setPdfUrl] = useState(meeting?.pdf_url ?? '');
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [contentKey, setContentKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useFormShortcuts(onCloseAction);

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setExtractError('');

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/ca/extract-pdf', { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok) {
      setPdfUrl(data.pdfUrl);
      if (data.html) {
        setContent(data.html);
        setContentKey((k) => k + 1);
        if (!title) {
          setTitle(file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' '));
        }
      }
      if (data.error) setExtractError('Extraction partielle — vérifiez le contenu.');
    } else {
      setExtractError(data.error ?? "Erreur lors de l'upload");
    }

    setExtracting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const saved = await upsertMeeting(
      { title, meeting_date: meetingDate, content, pdf_url: pdfUrl || null },
      meeting?.id,
    );
    if (saved) {
      onSaveAction(saved);
      toast.success(meeting ? 'Compte-rendu modifié' : 'Compte-rendu ajouté');
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-5 text-foreground">
        {meeting ? 'Modifier le compte-rendu' : 'Nouveau compte-rendu'}
      </h2>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            PDF du compte-rendu <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
                  extracting
                    ? 'border-primary bg-primary/10 text-primary pointer-events-none'
                    : 'border-border text-foreground/60 hover:border-primary hover:text-primary bg-background'
                }`}
              >
                {extracting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    Extraction en cours...
                  </>
                ) : pdfUrl ? (
                  <>📄 Changer le PDF</>
                ) : (
                  <>📄 Importer un PDF</>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                className="hidden"
                disabled={extracting}
              />
            </label>
            {pdfUrl && !extracting && (
              <Link
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:opacity-70 transition-opacity"
              >
                Voir le PDF →
              </Link>
            )}
          </div>
          {extracting && <p className="text-xs text-primary/70">Extraction en cours...</p>}
          {extractError && <p className="text-xs text-orange-500">{extractError}</p>}
          {pdfUrl && !extracting && (
            <p className="text-xs text-foreground/40">Le PDF sera disponible pour les choristes.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Titre</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
              placeholder="Réunion CA — Mars 2026"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground">Date de la réunion</label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              required
              className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Contenu</label>
            {pdfUrl && <span className="text-xs text-foreground/40">Pré-rempli depuis le PDF</span>}
          </div>
          <div className="rounded-xl overflow-hidden border border-border">
            <RichEditor
              key={contentKey}
              content={content}
              onChangeAction={setContent}
              placeholder="Compte-rendu de la réunion..."
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onCloseAction}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving || extracting} loading={saving || extracting}>
            {saving ? 'Sauvegarde...' : meeting ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </div>
  );
}
