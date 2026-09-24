'use client';

import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ROLE_LABELS } from '../types';

// Badge de rôle ; survol ou clic affiche le détail du rôle bureau dans une infobulle
export function RoleBadge({ role, bureauRole }: { role: string; bureauRole?: string | null }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  const roleClass =
    role === 'admin' || role === 'super_admin'
      ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300'
      : role === 'ca'
        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
        : 'bg-foreground/10 text-foreground/50';

  const lines = bureauRole
    ? bureauRole
        .split(/\n|\s+-\s+/)
        .map((r) => r.replace(/\//g, ' ').trim())
        .filter(Boolean)
    : [];

  return (
    <div
      role="button"
      tabIndex={0}
      className="inline-flex"
      onMouseEnter={() =>
        lines.length ? setRect(ref.current?.getBoundingClientRect() ?? null) : undefined
      }
      onMouseLeave={() => setRect(null)}
      onClick={(e) => {
        e.stopPropagation();
        if (lines.length)
          setRect((r) => (r ? null : (ref.current?.getBoundingClientRect() ?? null)));
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.stopPropagation();
        if (lines.length)
          setRect((r) => (r ? null : (ref.current?.getBoundingClientRect() ?? null)));
      }}
    >
      <span
        ref={ref}
        className={`text-xs px-2 py-0.5 rounded-full ${roleClass} ${lines.length ? 'cursor-help' : ''}`}
      >
        {ROLE_LABELS[role]}
      </span>
      {rect &&
        lines.length > 0 &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: rect.top + rect.height / 2,
              left: rect.right + 8,
              transform: 'translateY(-50%)',
              zIndex: 9999,
              pointerEvents: 'none',
              maxWidth: `min(220px, calc(100vw - ${rect.right + 16}px))`,
            }}
          >
            <div className="bg-app-green text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg">
              {lines.map((line) => (
                <p key={line} className="m-0 whitespace-nowrap">
                  {line}
                </p>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
