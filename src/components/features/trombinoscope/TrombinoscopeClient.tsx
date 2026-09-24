'use client';

import { useMemo, useState } from 'react';
import { BookImage, FileText, Mail, MailCheck } from 'lucide-react';
import { toast } from 'sonner';

import { ButtonIcon } from '@/components/ui/ButtonIcon';
import { VoicePartFilter } from '@/components/ui/VoicePartFilter';
import { useLocalStorage } from '@/hooks/useLocalStorage';

import { ColumnMenu } from './ColumnMenu';
import { exportMembersListPdf, exportTrombiPdf } from './trombiPdfExport';
import type { TrombiSortDir, TrombiSortKey } from './TrombiTable';
import { TrombiTable } from './TrombiTable';
import type { Column, ColumnKey, TrombiMember, VoicePart } from './types';
import { DEFAULT_COLUMNS } from './types';

const ROLE_GROUPS = [
  {
    key: 'membre',
    label: 'Membre',
    roles: ['member'] as string[],
    active: 'bg-foreground/15 text-foreground',
    inactive: 'bg-background-secondary text-foreground/30',
  },
  {
    key: 'ca',
    label: 'CA',
    roles: ['ca', 'admin'] as string[],
    active: 'bg-secondary text-white',
    inactive: 'bg-background-secondary text-foreground/30',
  },
] as const;

function serializeColumns(cols: Column[]): string {
  return JSON.stringify(cols.map(({ key, visible }) => ({ key, visible })));
}

function deserializeColumns(raw: string): Column[] {
  try {
    const stored = JSON.parse(raw) as { key: ColumnKey; visible: boolean }[];
    const result: Column[] = [];
    for (const { key, visible } of stored) {
      const col = DEFAULT_COLUMNS.find((c) => c.key === key);
      if (col) result.push({ ...col, visible });
    }
    for (const col of DEFAULT_COLUMNS) {
      if (!result.some((c) => c.key === col.key)) result.push(col);
    }
    return result;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

function sortTrombiMembers(
  members: TrombiMember[],
  sortKey: TrombiSortKey,
  sortDir: TrombiSortDir,
) {
  return [...members].sort((a, b) => {
    let valA = '',
      valB = '';
    switch (sortKey) {
      case 'first_name':
        valA = a.first_name ?? '';
        valB = b.first_name ?? '';
        break;
      case 'last_name':
        valA = a.last_name ?? '';
        valB = b.last_name ?? '';
        break;
      case 'voice_part':
        valA = String(a.voice_parts?.order_index ?? 999);
        valB = String(b.voice_parts?.order_index ?? 999);
        break;
      case 'address':
        valA = `${a.city ?? ''} ${a.address ?? ''}`;
        valB = `${b.city ?? ''} ${b.address ?? ''}`;
        break;
    }
    const cmp = valA.localeCompare(valB, 'fr');
    return sortDir === 'asc' ? cmp : -cmp;
  });
}

type Props = {
  members: TrombiMember[];
  voiceParts: VoicePart[];
};

export function TrombinoscopeClient({ members, voiceParts }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useLocalStorage<TrombiSortKey>('trombi:sortKey', 'last_name');
  const [sortDir, setSortDir] = useLocalStorage<TrombiSortDir>('trombi:sortDir', 'asc');
  const [columns, setColumns] = useLocalStorage<Column[]>('trombi:columns', DEFAULT_COLUMNS, {
    serialize: serializeColumns,
    deserialize: deserializeColumns,
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedRoleGroups, setSelectedRoleGroups] = useState<Set<string>>(
    () => new Set(ROLE_GROUPS.map((g) => g.key)),
  );

  const realParts = useMemo(
    () => voiceParts.filter((vp) => vp.is_voice_part !== false),
    [voiceParts],
  );

  const [storedVoicePartIds, setStoredVoicePartIds] = useLocalStorage<string[] | null>(
    'trombi:voicePartIds',
    null,
  );

  const selectedVoicePartIds = useMemo(() => {
    if (storedVoicePartIds === null) return new Set(realParts.map((vp) => vp.id));
    const valid = storedVoicePartIds.filter((id) => realParts.some((vp) => vp.id === id));
    return valid.length > 0 ? new Set(valid) : new Set(realParts.map((vp) => vp.id));
  }, [storedVoicePartIds, realParts]);

  function toggleRoleGroup(key: string) {
    setSelectedRoleGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev;
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleVoicePart(id: string) {
    const next = new Set(selectedVoicePartIds);
    if (next.has(id)) {
      if (next.size === 1) return;
      next.delete(id);
    } else {
      next.add(id);
    }
    setStoredVoicePartIds([...next]);
  }

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const matchSearch =
          search === '' ||
          `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
          (m.city ?? '').toLowerCase().includes(search.toLowerCase());
        if (m.role === 'super_admin') return false;
        const matchVoicePart = !m.voice_part_id || selectedVoicePartIds.has(m.voice_part_id);
        const memberRole = m.role ?? 'member';
        const matchRole = ROLE_GROUPS.some(
          (g) => selectedRoleGroups.has(g.key) && (g.roles as string[]).includes(memberRole),
        );
        return matchSearch && matchVoicePart && matchRole;
      }),
    [members, search, selectedVoicePartIds, selectedRoleGroups],
  );

  const sorted = useMemo(
    () => sortTrombiMembers(filtered, sortKey, sortDir),
    [filtered, sortKey, sortDir],
  );

  function handleSort(key: TrombiSortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  async function copyEmails() {
    const entries = sorted
      .filter((m) => m.email)
      .map((m) => {
        const name = [m.first_name, m.last_name].filter(Boolean).join(' ');
        return name ? `${name} <${m.email}>` : m.email!;
      });
    await navigator.clipboard.writeText(entries.join(', '));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    toast.success(
      `${entries.length} email${entries.length > 1 ? 's' : ''} copié${entries.length > 1 ? 's' : ''}`,
      {
        description: 'Collez directement dans le champ CCI de votre messagerie.',
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-medium text-foreground">Trombinoscope</h1>
        <p className="text-sm text-foreground/50 mt-1">
          <span className="text-primary font-medium">{sorted.length}</span> choriste
          {sorted.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {/* Ligne 1 : recherche + actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un choriste..."
              className="border border-border rounded-lg px-3 py-1.5 pr-7 text-sm bg-background w-full"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
                aria-label="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <ButtonIcon
              onClick={() => exportMembersListPdf(sorted, columns)}
              title="Exporter liste PDF"
            >
              <FileText />
            </ButtonIcon>
            <ButtonIcon onClick={() => exportTrombiPdf(sorted)} title="Exporter trombinoscope PDF">
              <BookImage />
            </ButtonIcon>
            <ButtonIcon
              onClick={copyEmails}
              title="Copier les emails"
              className={
                copySuccess
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-foreground/60 hover:text-foreground hover:border-primary'
              }
            >
              {copySuccess ? <MailCheck /> : <Mail />}
            </ButtonIcon>

            <ColumnMenu columns={columns} onColumnsChangeAction={setColumns} />
          </div>
        </div>

        {/* Ligne 2 : filtres par pupitre + rôle */}
        <div className="flex items-center gap-2 flex-wrap">
          <VoicePartFilter
            voiceParts={realParts}
            selectedIds={selectedVoicePartIds}
            onToggleAction={toggleVoicePart}
          />

          <div className="flex items-center rounded-lg overflow-hidden border border-border">
            {ROLE_GROUPS.map((g, index) => {
              const active = selectedRoleGroups.has(g.key);
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggleRoleGroup(g.key)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${active ? g.active : g.inactive}${index > 0 ? ' border-l border-white/20' : ''}`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <TrombiTable
        members={sorted}
        columns={columns.filter((c) => c.visible)}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortAction={handleSort}
      />
    </div>
  );
}
