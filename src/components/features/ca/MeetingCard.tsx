import Link from 'next/link';
import { formatDate } from '@/utils/dateHelpers';
import { CaMeeting } from './types';

export function MeetingCard({ meeting }: { meeting: CaMeeting }) {
  const date = formatDate(meeting.meeting_date);

  return (
    <details className="border border-border rounded-xl bg-background group">
      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none hover:bg-background-secondary transition-colors rounded-xl gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{meeting.title}</p>
          <p className="text-xs text-foreground/50 mt-0.5">{date}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {meeting.pdf_url && (
            <Link
              href={meeting.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-foreground/50 hover:text-primary hover:border-primary transition-all no-underline"
            >
              📄 PDF
            </Link>
          )}
          <span className="text-foreground/30 text-sm transition-transform group-open:rotate-180">
            ▼
          </span>
        </div>
      </summary>
      <div
        className="px-6 pb-6 pt-4 mdx-content border-t border-border"
        dangerouslySetInnerHTML={{ __html: meeting.content }}
      />
    </details>
  );
}
