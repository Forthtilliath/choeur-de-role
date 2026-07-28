import Link from 'next/link';
import { MemberLink, Visibility, VISIBILITY_BADGE, VISIBILITY_LABEL } from './types';

export function LinkCard({ link }: { link: MemberLink }) {
  const visibility = (link.visibility as Visibility) ?? 'member';
  const showBadge = visibility !== 'member';

  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:bg-background-secondary transition-colors no-underline group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-primary text-lg">🔗</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {link.label}
        </p>
        {link.description && (
          <p className="text-xs text-foreground/50 truncate mt-0.5">{link.description}</p>
        )}
      </div>
      {showBadge && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${VISIBILITY_BADGE[visibility]}`}
        >
          {VISIBILITY_LABEL[visibility]}
        </span>
      )}
      <span className="text-foreground/30 text-sm shrink-0">→</span>
    </Link>
  );
}
