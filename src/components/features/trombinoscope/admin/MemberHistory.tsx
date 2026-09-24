'use client';

import { useState } from 'react';

import type { MemberHistoryEntry } from '../queries';

import { getMemberAuditHistory } from './actions';

const ACTION_HISTORY_LABELS: Record<string, string> = {
  member_create: 'Membre créé',
  member_update: 'Membre modifié',
  member_delete: 'Membre supprimé',
  password_reset: 'Mot de passe réinitialisé',
  email_change: 'Email modifié',
  resend_invite: 'Invitation renvoyée',
};

const FIELD_LABELS: Record<string, string> = {
  first_name: 'Prénom',
  last_name: 'Nom',
  phone: 'Téléphone',
  birthday: 'Naissance',
  address: 'Adresse',
  zip_code: 'Code postal',
  city: 'Ville',
  voice_part_id: 'Pupitre',
  role: 'Rôle',
  bureau_role: 'Rôle bureau',
};

function formatFieldValue(field: string, value: unknown): string {
  if (value == null || value === '') return '—';
  if (field === 'birthday' && typeof value === 'string') {
    const d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return String(value);
}

function formatHistoryDate(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

// Historique d'audit d'un membre, chargé à la première ouverture
export function MemberHistory({ memberId }: { memberId: string }) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<MemberHistoryEntry[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  return (
    <div className="mt-4 border-t border-border pt-4">
      <button
        type="button"
        onClick={async () => {
          if (!historyOpen && history === null) {
            setHistoryLoading(true);
            const logs = await getMemberAuditHistory(memberId);
            setHistory(logs);
            setHistoryLoading(false);
          }
          setHistoryOpen((v) => !v);
        }}
        className="flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground transition-colors"
      >
        <span>{historyOpen ? '▲' : '▼'}</span>
        Historique des modifications
      </button>

      {historyOpen && (
        <div className="mt-3 flex flex-col gap-2">
          {historyLoading && <p className="text-xs text-foreground/40">Chargement…</p>}
          {!historyLoading && history?.length === 0 && (
            <p className="text-xs text-foreground/40">Aucune modification enregistrée.</p>
          )}
          {!historyLoading &&
            history?.map((entry) => (
              <div
                key={entry.id}
                className="border border-border rounded-lg px-3 py-2 bg-background text-xs flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground/70">
                    {ACTION_HISTORY_LABELS[entry.action] ?? entry.action}
                  </span>
                  <span className="text-foreground/30 shrink-0">
                    {formatHistoryDate(entry.created_at)}
                  </span>
                </div>
                {entry.actor_name && (
                  <span className="text-foreground/40">par {entry.actor_name}</span>
                )}
                {!!entry.details?.changes && (
                  <div className="mt-1 flex flex-col gap-0.5">
                    {Object.entries(
                      entry.details.changes as Record<string, { from: unknown; to: unknown }>,
                    ).map(([field, { from, to }]) => (
                      <p key={field} className="text-foreground/50">
                        <span className="font-medium">{FIELD_LABELS[field] ?? field}</span>
                        {' : '}
                        <span className="line-through text-foreground/30">
                          {formatFieldValue(field, from)}
                        </span>
                        {' → '}
                        <span className="text-foreground">{formatFieldValue(field, to)}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
