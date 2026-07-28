'use client';

import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { BookImage, FileText, Mail, MailCheck } from 'lucide-react';
import { ButtonIcon } from '@/components/ui/ButtonIcon';
import { VoicePartFilter } from '@/components/ui/VoicePartFilter';
import { MemberCell, getVoicePartBg } from './MemberCell';
import { SortableColumnRow } from './SortableColumnRow';
import { Column, ColumnKey, DEFAULT_COLUMNS, TrombiMember, VoicePart } from './types';
import { useDndSensors } from '@/hooks/useDndSensors';

type SortKey = 'first_name' | 'last_name' | 'voice_part' | 'address';
type SortDir = 'asc' | 'desc';

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

type Props = {
  members: TrombiMember[];
  voiceParts: VoicePart[];
};

export function TrombinoscopeClient({ members, voiceParts }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useLocalStorage<SortKey>('trombi:sortKey', 'last_name');
  const [sortDir, setSortDir] = useLocalStorage<SortDir>('trombi:sortDir', 'asc');
  const [columns, setColumns] = useLocalStorage<Column[]>('trombi:columns', DEFAULT_COLUMNS, {
    serialize: serializeColumns,
    deserialize: deserializeColumns,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedRoleGroups, setSelectedRoleGroups] = useState<Set<string>>(
    new Set(ROLE_GROUPS.map((g) => g.key)),
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

  const sensors = useDndSensors();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setColumns((prev) => {
      const oldIndex = prev.findIndex((c) => c.key === active.id);
      const newIndex = prev.findIndex((c) => c.key === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

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
    () =>
      [...filtered].sort((a, b) => {
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
      }),
    [filtered, sortKey, sortDir],
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleColumnVisible(key: ColumnKey) {
    setColumns((prev) =>
      prev.map((col) => (col.key === key ? { ...col, visible: !col.visible } : col)),
    );
  }

  function resetColumns() {
    setColumns(DEFAULT_COLUMNS);
    setShowColumnMenu(false);
  }

  async function copyEmails() {
    const entries = sorted.filter((m) => m.email).map((m) => {
      const name = [m.first_name, m.last_name].filter(Boolean).join(' ');
      return name ? `${name} <${m.email}>` : m.email!;
    });
    await navigator.clipboard.writeText(entries.join(', '));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    toast.success(`${entries.length} email${entries.length > 1 ? 's' : ''} copié${entries.length > 1 ? 's' : ''}`, {
      description: 'Collez directement dans le champ CCI de votre messagerie.',
    });
  }

  async function exportPDFList() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Chœur de Rôle — Liste des choristes', 14, 16);
    doc.setFontSize(10);
    doc.text(`${sorted.length} choristes — ${new Date().toLocaleDateString('fr-FR')}`, 14, 23);

    const visibleCols = columns.filter((c) => c.visible && c.key !== 'photo' && c.key !== 'ca');
    const head = [visibleCols.map((c) => c.label)];
    const body = sorted.map((m) =>
      visibleCols.map((col) => {
        switch (col.key) {
          case 'voice_part':
            return m.voice_parts?.name ?? '';
          case 'first_name':
            return m.first_name ?? '';
          case 'last_name':
            return m.last_name ?? '';
          case 'address':
            return [m.address, m.zip_code, m.city].filter(Boolean).join(', ');
          case 'email':
            return m.email ?? '';
          case 'phone': {
            const digits = (m.phone ?? '').replace(/\D/g, '');
            return digits.length === 10 ? digits.match(/.{2}/g)!.join(' ') : (m.phone ?? '');
          }
          default:
            return '';
        }
      }),
    );
    autoTable(doc, { head, body, startY: 28, styles: { fontSize: 9 } });
    doc.save('choristes.pdf');
  }

  async function exportPDFTrombi() {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    doc.setFontSize(14);
    doc.text('Trombinoscope — Chœur de Rôle', pageW / 2, 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`${sorted.length} choristes — ${new Date().toLocaleDateString('fr-FR')}`, pageW / 2, 20, { align: 'center' });
    doc.setTextColor(0);

    const cols = 5;
    const cellW = 38;
    const cellH = 54;
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = (pageWidth - cols * cellW) / 2;
    const marginY = 26;
    const pageHeight = doc.internal.pageSize.getHeight();

    async function fetchImageBase64(url: string): Promise<string | null> {
      try {
        const cleanUrl = url.split('?')[0];
        const res = await fetch(`/api/r2/image-view?url=${encodeURIComponent(cleanUrl)}`);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    }

    const photoMap = new Map<string, string | null>();
    await Promise.all(
      sorted
        .filter((m) => m.photo_url)
        .map(async (m) => {
          const b64 = await fetchImageBase64(m.photo_url!);
          photoMap.set(m.id, b64);
        }),
    );

    let currentPage = 0;
    for (let i = 0; i < sorted.length; i++) {
      const m = sorted[i];
      const itemsPerPage = Math.floor((pageHeight - marginY) / cellH) * cols;
      const indexOnPage = i % itemsPerPage;
      const colOnPage = indexOnPage % cols;
      const rowOnPage = Math.floor(indexOnPage / cols);

      const newPage = Math.floor(i / itemsPerPage);
      if (newPage > currentPage) {
        doc.addPage();
        currentPage = newPage;
      }

      const x = marginX + colOnPage * cellW;
      const y = marginY + rowOnPage * cellH;
      const photoSize = 30;

      const photoB64 = photoMap.get(m.id);
      if (photoB64) {
        try {
          const fmt = photoB64.startsWith('data:image/png') ? 'PNG'
            : photoB64.startsWith('data:image/webp') ? 'WEBP'
            : 'JPEG';
          doc.addImage(photoB64, fmt, x, y, photoSize, photoSize);
        } catch {
          drawPlaceholder(doc as unknown as import('jspdf').jsPDF, x, y, photoSize, m);
        }
      } else {
        drawPlaceholder(doc as unknown as import('jspdf').jsPDF, x, y, photoSize, m);
      }

      doc.setFontSize(8);
      doc.setTextColor(0);
      const fullName = `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim();
      const nameLines = doc.splitTextToSize(fullName, cellW - 2);
      doc.text(nameLines, x + photoSize / 2, y + photoSize + 5, { align: 'center' });

      if (m.voice_parts?.name) {
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text(m.voice_parts.name, x + photoSize / 2, y + photoSize + 11, { align: 'center' });
        doc.setTextColor(0);
      }
    }
    doc.save('trombinoscope.pdf');
  }

  const visibleColumns = columns.filter((c) => c.visible);
  const visibleCount = columns.filter((c) => c.visible).length;
  const totalCount = columns.length;

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
            <ButtonIcon onClick={exportPDFList} title="Exporter liste PDF">
              <FileText />
            </ButtonIcon>
            <ButtonIcon onClick={exportPDFTrombi} title="Exporter trombinoscope PDF">
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

            <div className="relative">
              <button
                onClick={() => setShowColumnMenu((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-sm ${showColumnMenu ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/60 hover:text-foreground hover:border-primary'}`}
              >
                <span className="hidden sm:inline">Colonnes</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${visibleCount === totalCount ? 'bg-foreground/10 text-foreground/40' : 'bg-primary text-white'}`}
                >
                  {visibleCount}/{totalCount}
                </span>
                <span className="text-xs opacity-60">{showColumnMenu ? '▲' : '▼'}</span>
              </button>

              {showColumnMenu && (
                <div className="absolute right-0 top-11 z-20 bg-background border border-border rounded-xl shadow-xl w-64 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-background-secondary flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground">Colonnes affichées</p>
                    <button
                      onClick={resetColumns}
                      className="text-xs text-foreground/40 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      ↺ Réinitialiser
                    </button>
                  </div>
                  <div className="px-4 py-2 bg-background-secondary/50 border-b border-border">
                    <p className="text-xs text-foreground/40">
                      ⠿ Glisser pour réordonner · toggle pour afficher/masquer
                    </p>
                  </div>
                  <div className="p-2">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={columns.map((c) => c.key)}
                        strategy={verticalListSortingStrategy}
                      >
                        {columns.map((col, index) => (
                          <SortableColumnRow
                            key={col.key}
                            col={col}
                            index={index}
                            total={columns.length}
                            onToggleAction={toggleColumnVisible}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              )}
            </div>

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

      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background-secondary border-b border-border">
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-2.5 text-left font-medium text-xs text-foreground/50 tracking-wide whitespace-nowrap"
                  >
                    {(['first_name', 'last_name', 'voice_part', 'address'] as SortKey[]).includes(
                      col.key as SortKey,
                    ) ? (
                      <button
                        onClick={() => handleSort(col.key as SortKey)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {col.label}
                        <span className="text-xs opacity-60">
                          {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="dark:bg-white dark:text-gray-900">
              {sorted.map((member, memberIndex) => {
                const bg = getVoicePartBg(member.voice_parts?.name);
                return (
                  <tr key={member.id} className={`${bg} border-b border-white/40 dark:border-black/10 last:border-0`}>
                    {visibleColumns.map((col) => (
                      <td key={col.key} className="px-4 py-2">
                        <MemberCell col={col} member={member} priority={col.key === 'photo' && memberIndex < 3} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function drawPlaceholder(
  doc: import('jspdf').jsPDF,
  x: number,
  y: number,
  size: number,
  m: TrombiMember,
) {
  doc.setFillColor(220, 220, 220);
  doc.rect(x, y, size, size, 'F');
  const initials = `${(m.first_name ?? '?')[0]}${(m.last_name ?? '?')[0]}`.toUpperCase();
  doc.setFontSize(12);
  doc.setTextColor(150);
  doc.text(initials, x + size / 2, y + size / 2 + 4, { align: 'center' });
  doc.setTextColor(0);
}
