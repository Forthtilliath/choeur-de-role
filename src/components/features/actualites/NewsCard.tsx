import { SafeHtml } from '@/components/ui/SafeHtml';
import { formatDateTimeShort } from '@/utils/dateHelpers';

import type { News } from './types';

const UPDATE_THRESHOLD_MS = 60_000;

function getDisplayDate(news: News): string {
  const isUpdated =
    !!news.updated_at &&
    !!news.created_at &&
    new Date(news.updated_at).getTime() - new Date(news.created_at).getTime() > UPDATE_THRESHOLD_MS;

  if (news.scheduled_at) {
    // Mise à jour après la date de programmation → afficher la mise à jour
    if (isUpdated && new Date(news.updated_at!) > new Date(news.scheduled_at)) {
      return `Mis à jour le ${formatDateTimeShort(news.updated_at!)}`;
    }
    return formatDateTimeShort(news.scheduled_at);
  }

  if (isUpdated) return `Mis à jour le ${formatDateTimeShort(news.updated_at!)}`;
  return formatDateTimeShort(news.created_at ?? '');
}

export function NewsCard({ news }: { news: News }) {
  const displayDate = getDisplayDate(news);

  return (
    <div
      id={`news-${news.id}`}
      data-pinned={news.pinned ? 'true' : undefined}
      className={`card-game overflow-hidden scroll-mt-28 ${news.pinned ? 'ring-2 ring-secondary/60' : ''}`}
    >
      {news.pinned && (
        <div className="px-6 py-2 bg-secondary/15 border-b border-secondary/30">
          <p className="text-xs text-secondary-dark dark:text-secondary font-semibold uppercase tracking-[0.15em]">
            📌 Épinglée
          </p>
        </div>
      )}
      <div className="px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 mb-3">
          <h2 className="text-xl font-semibold text-foreground line-clamp-2">{news.title}</h2>
          <p className="text-xs text-foreground/60 shrink-0">{displayDate}</p>
        </div>
        <SafeHtml className="mdx-content text-sm" html={news.content} />

        {news.news_files.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
            {news.news_files.map((f) => (
              <a
                key={f.id}
                href={f.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-light flex items-center gap-2 hover:opacity-70 transition-opacity no-underline w-fit"
              >
                📎 {f.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
