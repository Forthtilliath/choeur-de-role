import Link from 'next/link';

import { SafeHtml } from '@/components/ui/SafeHtml';
import { formatDate } from '@/utils/dateHelpers';

import type { CaMeeting } from './types';

export function MeetingCard({ meeting }: { meeting: CaMeeting }) {
  const date = formatDate(meeting.meeting_date);

  return (
    <details className="card-game group">
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none hover:bg-background-secondary/60 transition-colors rounded-2xl gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-semibold text-foreground">{meeting.title}</p>
          <p className="text-xs text-foreground/50 mt-0.5">{date}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {meeting.pdf_url && (
            <Link
              href={meeting.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary/40 text-primary-light hover:border-primary hover:bg-primary/10 transition-colors no-underline"
            >
              📄 PDF
            </Link>
          )}
          <span className="text-secondary-dark dark:text-secondary text-sm transition-transform group-open:rotate-180">
            ▼
          </span>
        </div>
      </summary>
      <SafeHtml
        className="px-6 pb-6 pt-4 mdx-content border-t border-border"
        html={meeting.content}
      />
    </details>
  );
}
