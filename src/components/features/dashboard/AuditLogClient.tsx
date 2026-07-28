'use client';

import { useMemo, useState } from 'react';
import type { AuditAction } from '@/lib/auditLog';
import type { AuditLogEntry } from './queries';

const AUDIT_PAGE_SIZE = 25;

const ACTION_LABELS: Partial<Record<AuditAction, string>> = {
  member_create: 'Membre créé',
  member_update: 'Membre modifié',
  member_delete: 'Membre supprimé',
  password_reset: 'Mot de passe réinitialisé',
  password_reset_all: 'Réinit. générale des mots de passe',
  email_change: 'Email modifié',
  resend_invite: 'Invitation renvoyée',
  member_locked: 'Compte verrouillé',
  member_unlocked: 'Compte déverrouillé',
};

const DAY_OPTIONS = [
  { value: 7, label: '7 jours' },
  { value: 30, label: '30 jours' },
  { value: 90, label: '90 jours' },
  { value: null, label: 'Tout' },
];

function formatDate(iso: string) {
  const date = new Date(iso);
  const datePart = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${datePart} à ${h}h${m}`;
}

type Props = { logs: AuditLogEntry[]; hasMore?: boolean };

export function AuditLogClient({ logs, hasMore }: Props) {
  const [selectedAction, setSelectedAction] = useState<AuditAction | null>(null);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    const since = selectedDays
      ? new Date(now - selectedDays * 86_400_000).toISOString()
      : null;
    return logs.filter((log) => {
      if (selectedAction && log.action !== selectedAction) return false;
      if (since && log.created_at < since) return false;
      return true;
    });
  }, [logs, now, selectedAction, selectedDays]);

  const totalPages = Math.ceil(filtered.length / AUDIT_PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * AUDIT_PAGE_SIZE, page * AUDIT_PAGE_SIZE);

  function selectAction(action: AuditAction | null) {
    setSelectedAction(action);
    setPage(1);
  }

  function selectDays(days: number | null) {
    setSelectedDays(days);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground/50">Période :</span>
          {DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value ?? 'all'}
              onClick={() => selectDays(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedDays === opt.value
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-foreground/50">Action :</span>
          <button
            onClick={() => selectAction(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedAction === null
                ? 'bg-primary text-white border-primary'
                : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
            }`}
          >
            Toutes
          </button>
          {(Object.entries(ACTION_LABELS) as [AuditAction, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => selectAction(value as AuditAction)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedAction === value
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-xs text-foreground/40">
          {filtered.length} entrée{filtered.length !== 1 ? 's' : ''}
          {filtered.length !== logs.length && ` sur ${logs.length}`}
        </p>
        {hasMore && (
          <p className="text-xs text-foreground/30 italic">
            Affichant les 500 entrées les plus récentes
          </p>
        )}
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <p className="text-center text-foreground/50 py-12">Aucune entrée.</p>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-secondary">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-foreground/50 uppercase tracking-wide">
                  Action
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-foreground/50 uppercase tracking-wide hidden sm:table-cell">
                  Auteur
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-foreground/50 uppercase tracking-wide hidden lg:table-cell">
                  IP
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-foreground/50 uppercase tracking-wide">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-foreground">
                      {ACTION_LABELS[log.action as AuditAction] ?? log.action}
                    </span>
                    {log.target_name && (
                      <span className="text-xs text-foreground/50 block mt-0.5">
                        → {log.target_name}
                      </span>
                    )}
                    {!log.target_name && typeof log.details?.email === 'string' && (
                      <span className="text-xs text-foreground/40 block mt-0.5">
                        {log.details.email}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/60 hidden sm:table-cell">
                    {log.actor_name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-foreground/40 font-mono text-xs hidden lg:table-cell">
                    {log.ip ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-foreground/40 text-right text-xs whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-border text-sm text-foreground/60 hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Précédent
          </button>
          <span className="text-xs text-foreground/40">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-border text-sm text-foreground/60 hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
