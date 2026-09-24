'use client';

import { useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';

import { RichEditor } from '@/components/editor/RichEditorLazy';
import { Button } from '@/components/ui/Button';
import { useFormShortcuts } from '@/hooks/useFormShortcuts';
import { useNow } from '@/hooks/useNow';
import { toLocalDatetimeInput } from '@/lib/utils';
import { formatDateTimeShort } from '@/utils/dateHelpers';

import { upsertNews } from './clientQueries';
import { NewsFilesSection } from './NewsFilesSection';
import type { News, NewsFile } from './types';

export function NewsForm({
  news,
  totalNews,
  onClose,
  onSave,
}: {
  news: News | null;
  totalNews: number;
  onClose: () => void;
  onSave: (news: News) => void;
}) {
  const [title, setTitle] = useState(news?.title ?? '');
  const [content, setContent] = useState(news?.content ?? '');
  const [scheduledAt, setScheduledAt] = useState(() =>
    news?.scheduled_at ? toLocalDatetimeInput(news.scheduled_at) : '',
  );
  const [files, setFiles] = useState<NewsFile[]>(news?.news_files ?? []);
  const [saving, setSaving] = useState(false);
  const now = new Date(useNow());
  const formRef = useFormShortcuts(onClose);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const scheduledAtIso = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    const isSchedulingFuture = !!scheduledAtIso && new Date(scheduledAtIso) > new Date();

    const saved = await upsertNews(
      {
        title,
        content,
        scheduled_at: scheduledAtIso,
        // programmer pour le futur → publié automatiquement (visible dès la date)
        ...(isSchedulingFuture ? { published: true } : {}),
      },
      news?.id,
      totalNews,
    );

    if (saved) {
      onSave({ ...saved, news_files: files });
      if (isSchedulingFuture) {
        toast.success(`Actualité programmée pour le ${formatDateTimeShort(scheduledAtIso)}`);
      } else {
        toast.success(
          news
            ? 'Actualité modifiée'
            : 'Actualité créée — vous pouvez maintenant ajouter des fichiers',
        );
      }
    } else {
      toast.error('Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  return (
    <div className="border border-border rounded-2xl p-6 bg-background-secondary">
      <h2 className="text-base font-medium mb-5 text-foreground">
        {news ? "Modifier l'actualité" : 'Nouvelle actualité'}
      </h2>
      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="news-title" className="text-sm font-medium text-foreground">
            Titre
          </label>
          <input
            id="news-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
            placeholder="Répétition annulée le 15 mars"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Contenu</span>
          <RichEditor
            content={content}
            onChangeAction={setContent}
            placeholder="Contenu de l'actualité..."
          />
        </div>

        {/* Programmation */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="news-scheduled-at"
            className="text-sm font-medium text-foreground flex items-center gap-1.5"
          >
            <CalendarClock size={14} className="text-foreground/50" />
            Publication programmée
            <span className="text-foreground/40 font-normal">(optionnel)</span>
          </label>
          <input
            id="news-scheduled-at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={toLocalDatetimeInput(now.toISOString())}
            className="border border-border rounded-lg px-4 py-2 text-sm bg-background"
          />
          {scheduledAt && new Date(scheduledAt) > now && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              L&apos;actualité sera visible automatiquement le{' '}
              {formatDateTimeShort(new Date(scheduledAt).toISOString())}.
            </p>
          )}
        </div>

        {/* Section fichiers — disponible uniquement en mode édition */}
        {news ? (
          <NewsFilesSection newsId={news.id} files={files} onFilesChangeAction={setFiles} />
        ) : (
          <p className="text-xs text-foreground/50 bg-background rounded-lg px-3 py-2.5 border border-border">
            💡 Les documents pourront être ajoutés après la création de l&apos;actualité.
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving} loading={saving}>
            {saving ? 'Sauvegarde…' : news ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
