'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

type SortKey = 'last_name' | 'voice_part' | 'role' | 'updated' | 'birthday';
type SortDir = 'default' | 'asc' | 'desc';
type NameFormat = 'first_last' | 'last_first';
import { useConfirm } from '@/context/ConfirmContext';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { VoicePartFilter } from '@/components/ui/VoicePartFilter';
import { useNow } from '@/hooks/useNow';
import { Season } from '../../concerts';
import { bulkAssignSeason, deleteMember, resetAllMembersPasswords } from '../clientQueries';
import { formatDateTimeCompact } from '@/utils/dateHelpers';
import { AdminMemberWithSeasons, AuthInfo, VoicePart } from '../types';
import { CreateMemberForm } from './CreateMemberForm';
import { CsvImportPanel } from './CsvImportPanel';
import { MemberForm } from './MemberForm';
import { MemberRow } from './MemberRow';
import { RECENT_MS } from './constants';

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
    roles: ['ca', 'admin', 'super_admin'] as string[],
    active: 'bg-secondary text-white',
    inactive: 'bg-background-secondary text-foreground/30',
  },
] as const;

type Props = {
  initialMembers: AdminMemberWithSeasons[];
  voiceParts: VoicePart[];
  currentUserRole: string;
  authMap: Record<string, AuthInfo>;
  seasons: Season[];
};

export function MembresAdminClient({
  initialMembers,
  voiceParts,
  currentUserRole,
  authMap,
  seasons,
}: Props) {
  const [members, setMembers] = useState<AdminMemberWithSeasons[]>(initialMembers);
  const [localAuthMap, setLocalAuthMap] = useState<Record<string, AuthInfo>>(authMap);
  const [search, setSearch] = useState('');
  const [selectedVoicePartIds, setSelectedVoicePartIds] = useState<Set<string>>(
    new Set(voiceParts.map((vp) => vp.id)),
  );
  const [showForm, setShowForm] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminMemberWithSeasons | null>(null);
  const [showRecent, setShowRecent] = useState(false);
  const [bulkResetting, setBulkResetting] = useState(false);
  const confirm = useConfirm();
  const [bulkResetResult, setBulkResetResult] = useState<number | null>(null);
  const now = useNow();
  const [filterSeasonId, setFilterSeasonId] = useState('');
  const [showLocked, setShowLocked] = useState(false);
  const [selectedRoleGroups, setSelectedRoleGroups] = useState<Set<string>>(
    new Set(ROLE_GROUPS.map((g) => g.key)),
  );
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableInnerRef = useRef<HTMLTableElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = tableScrollRef.current;
    const inner = tableInnerRef.current;
    if (!el) return;
    updateScrollState();
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    if (inner) ro.observe(inner);
    return () => ro.disconnect();
  }, [updateScrollState]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') tableScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
      if (e.key === 'ArrowRight') tableScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('default');
  const [nameFormat, setNameFormat] = useState<NameFormat>('first_last');

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir('asc');
        return key;
      }
      setSortDir((d) => (d === 'default' ? 'asc' : d === 'asc' ? 'desc' : 'default'));
      return key;
    });
  }, []);

  function toggleSelectionMode() {
    setSelectionMode((v) => !v);
    setSelectedIds(new Set());
  }

  function toggleMember(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
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
    setSelectedVoicePartIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
      } else next.add(id);
      return next;
    });
  }

  const filtered = useMemo(
    () =>
      members.filter((m) => {
        const matchSearch =
          search === '' ||
          `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(search.toLowerCase());
        const matchPart = !m.voice_part_id || selectedVoicePartIds.has(m.voice_part_id);
        const matchSeason =
          !filterSeasonId || m.member_season.some((ms) => ms.season_id === filterSeasonId);
        const isLocked = localAuthMap[m.id]?.isLocked ?? false;
        const matchLocked = showLocked || !isLocked;
        const memberRole = m.role ?? 'member';
        const matchRole = ROLE_GROUPS.some(
          (g) => selectedRoleGroups.has(g.key) && (g.roles as string[]).includes(memberRole),
        );
        return matchSearch && matchPart && matchSeason && matchLocked && matchRole;
      }),
    [members, search, selectedVoicePartIds, filterSeasonId, showLocked, localAuthMap, selectedRoleGroups],
  );

  const sorted = useMemo(() => {
    if (!sortKey || sortDir === 'default') {
      return [...filtered].sort((a, b) => {
        const cmpLast = (a.last_name ?? '').localeCompare(b.last_name ?? '', 'fr');
        if (cmpLast !== 0) return cmpLast;
        return (a.first_name ?? '').localeCompare(b.first_name ?? '', 'fr');
      });
    }
    return [...filtered].sort((a, b) => {
      let valA = '';
      let valB = '';
      switch (sortKey) {
        case 'last_name': {
          const dir = sortDir === 'asc' ? 1 : -1;
          if (nameFormat === 'last_first') {
            const cmpLast = (a.last_name ?? '').localeCompare(b.last_name ?? '', 'fr');
            if (cmpLast !== 0) return dir * cmpLast;
            return dir * (a.first_name ?? '').localeCompare(b.first_name ?? '', 'fr');
          } else {
            const cmpFirst = (a.first_name ?? '').localeCompare(b.first_name ?? '', 'fr');
            if (cmpFirst !== 0) return dir * cmpFirst;
            return dir * (a.last_name ?? '').localeCompare(b.last_name ?? '', 'fr');
          }
        }
        case 'voice_part':
          valA = a.voice_parts?.name ?? '';
          valB = b.voice_parts?.name ?? '';
          break;
        case 'role': {
          const rank: Record<string, number> = { member: 0, ca: 1, admin: 2, super_admin: 3 };
          const ra = rank[a.role ?? ''] ?? -1;
          const rb = rank[b.role ?? ''] ?? -1;
          return sortDir === 'asc' ? ra - rb : rb - ra;
        }
        case 'birthday':
          valA = a.birthday ?? '';
          valB = b.birthday ?? '';
          break;
        case 'updated':
          valA = a.updated_at ?? '';
          valB = b.updated_at ?? '';
          break;
      }
      const cmp = valA.localeCompare(valB, 'fr');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, nameFormat]);

  const eligibleFiltered = sorted.filter((m) => m.email);
  const allChecked =
    eligibleFiltered.length > 0 && eligibleFiltered.every((m) => selectedIds.has(m.id));
  const someSelected = eligibleFiltered.some((m) => selectedIds.has(m.id));

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = someSelected && !allChecked;
  }, [someSelected, allChecked]);

  useEffect(() => {
    document.documentElement.style.overflowY = showForm ? 'hidden' : '';
    return () => { document.documentElement.style.overflowY = ''; };
  }, [showForm]);

  function toggleAll() {
    const eligible = eligibleFiltered.map((m) => m.id);
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligible));
    }
  }

  async function handleBulkAssignSeason(seasonId: string) {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    const season = seasons.find((s) => s.id === seasonId);
    const ok = await bulkAssignSeason(ids, seasonId);
    if (ok) {
      setMembers((prev) =>
        prev.map((m) =>
          selectedIds.has(m.id) && !m.member_season.find((ms) => ms.season_id === seasonId)
            ? { ...m, member_season: [...m.member_season, { season_id: seasonId }] }
            : m,
        ),
      );
      toast.success(`${ids.length} membre${ids.length > 1 ? 's' : ''} ajouté${ids.length > 1 ? 's' : ''} à la saison ${season?.label ?? ''}`);
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  function exportToCsv() {
    const seasonMap = new Map(seasons.map((s) => [s.id, s.label ?? '']));
    const headers = ['prénom', 'nom', 'email', 'téléphone', 'adresse', 'code_postal', 'ville', 'date_de_naissance', 'pupitre', 'rôle', 'rôle_bureau', 'saisons'];
    const csvRows = members.map((m) => [
      m.first_name ?? '',
      m.last_name ?? '',
      m.email ?? '',
      m.phone ?? '',
      m.address ?? '',
      m.zip_code ?? '',
      m.city ?? '',
      m.birthday ?? '',
      m.voice_parts?.name ?? '',
      m.role ?? '',
      m.bureau_role ?? '',
      m.member_season.map((ms) => seasonMap.get(ms.season_id ?? '') ?? '').filter(Boolean).join(' | '),
    ]);
    const content = [headers, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `membres-cda-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copySelectedEmails() {
    const selectedMembers = members.filter((m) => selectedIds.has(m.id) && m.email);
    const entries = selectedMembers.map((m) => {
      const name = [m.first_name, m.last_name].filter(Boolean).join(' ');
      return name ? `${name} <${m.email}>` : m.email!;
    });
    await navigator.clipboard.writeText(entries.join(', '));
    toast.success(`${entries.length} email${entries.length > 1 ? 's' : ''} copié${entries.length > 1 ? 's' : ''}`, {
      description: 'Collez directement dans le champ CCI de votre messagerie.',
    });
  }

  const recentlyUpdatedBySelf = useMemo(
    () =>
      members.filter(
        (m) => m.self_updated_at && now - new Date(m.self_updated_at).getTime() < RECENT_MS,
      ),
    [members, now],
  );

  function handleSave(member: AdminMemberWithSeasons) {
    setMembers((prev) => {
      const exists = prev.find((m) => m.id === member.id);
      return exists ? prev.map((m) => (m.id === member.id ? member : m)) : [...prev, member];
    });
    setShowForm(false);
    setEditingMember(null);
  }

  function handlePhotoUpdate(memberId: string, photoUrl: string) {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, photo_url: photoUrl } : m)),
    );
  }

  function handleLockToggle(memberId: string, locked: boolean) {
    setLocalAuthMap((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], isLocked: locked },
    }));
  }

  async function handleDelete(id: string) {
    const item = members.find((m) => m.id === id);
    if (item?.role === 'super_admin') return;
    const name = [item?.first_name, item?.last_name].filter(Boolean).join(' ');
    if (!await confirm({
      message: 'Supprimer définitivement ce membre ?',
      danger: true,
      details: name ? { icon: '👤', label: name, sublabel: item?.email ?? undefined } : undefined,
    })) return;
    const ok = await deleteMember(id);
    if (ok) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success('Membre supprimé');
    } else {
      toast.error('Erreur lors de la suppression');
    }
  }

  async function handleBulkPasswordResetClick() {
    const ok = await confirm({
      title: 'Réinitialiser tous les mots de passe',
      message:
        'Tous les choristes ayant un compte confirmé recevront immédiatement un email avec un nouveau mot de passe. Leur mot de passe actuel sera invalidé.',
      confirmLabel: 'Réinitialiser tous les mots de passe',
      danger: true,
      requireTyping: 'CONFIRMER',
      warning: 'Attention — cette action est irréversible.',
    });
    if (!ok) return;
    setBulkResetting(true);
    setBulkResetResult(null);
    const count = await resetAllMembersPasswords();
    setBulkResetResult(count);
    setBulkResetting(false);
    if (count !== null && count > 0) {
      toast.success(`${count} choriste${count > 1 ? 's' : ''} ont reçu leur nouveau mot de passe`);
    } else if (count === 0) {
      toast.success('Aucun compte confirmé à réinitialiser');
    } else {
      toast.error('Erreur lors de la réinitialisation des mots de passe');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Barre d&apos;outils */}
      <div className="flex flex-col gap-2">
        {/* Ligne 1 : recherche + actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un membre..."
              className="border border-border rounded-lg px-2 py-1 pr-7 text-sm bg-background w-full"
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
          <div className="ml-auto flex gap-2 shrink-0 flex-wrap">
            <Button variant="ghost" onClick={toggleSelectionMode} size="sm">
              {selectionMode ? 'Annuler la sélection' : 'Sélectionner'}
            </Button>
            <Button variant="ghost" onClick={exportToCsv} size="sm">
              Exporter CSV
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setShowForm(false); setShowCsvImport((v) => !v); }}
              size="sm"
            >
              Importer CSV
            </Button>
            <Button
              onClick={() => { setShowCsvImport(false); setEditingMember(null); setShowForm(true); }}
              size="sm"
            >
              Ajouter un membre
            </Button>
          </div>
        </div>

        {/* Ligne 2 : filtres */}
        <div className="flex items-center gap-2 flex-wrap">
          <VoicePartFilter
            voiceParts={voiceParts}
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
          <Select
            value={filterSeasonId}
            onChange={(e) => setFilterSeasonId(e.target.value)}
            className="px-2 py-1 text-foreground/70"
          >
            <option value="">Toutes les saisons</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </Select>
          <button
            onClick={() => setShowLocked((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${showLocked ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground/50 hover:border-foreground/30'}`}
          >
            🔒 {showLocked ? 'Masquer les verrouillés' : 'Voir les verrouillés'}
          </button>
          {recentlyUpdatedBySelf.length > 0 && (
            <button
              onClick={() => setShowRecent((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${showRecent ? 'border-primary bg-primary/10 text-primary' : 'border-orange-300 text-orange-500'}`}
            >
              ✏️ {recentlyUpdatedBySelf.length} modif{recentlyUpdatedBySelf.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Barre de sélection */}
      {selectionMode && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-sm">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="w-4 h-4 rounded accent-primary cursor-pointer shrink-0"
          />
          <span className="text-foreground/60 flex-1">
            {selectedIds.size > 0
              ? `${selectedIds.size} membre${selectedIds.size > 1 ? 's' : ''} sélectionné${selectedIds.size > 1 ? 's' : ''}`
              : 'Cliquez sur les lignes pour sélectionner'}
          </span>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={copySelectedEmails}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Mail size={13} />
                Copier les emails ({selectedIds.size})
              </button>
              <div className="flex items-center gap-1.5">
                <Select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) handleBulkAssignSeason(e.target.value); e.target.value = ''; }}
                  className="text-xs px-2 py-1 text-foreground/70 cursor-pointer"
                >
                  <option value="" disabled>Ajouter à la saison…</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modifications récentes */}
      {showRecent && recentlyUpdatedBySelf.length > 0 && (
        <div className="border border-primary/30 bg-primary/5 rounded-2xl p-4 flex flex-col gap-2">
          <p className="text-xs font-medium text-primary mb-1">Modifications des dernières 48h</p>
          {recentlyUpdatedBySelf.map((m) => (
            <div key={m.id} className="flex items-center gap-3 text-sm">
              <span className="text-foreground font-medium">
                {m.first_name} {m.last_name}
              </span>
              <span className="text-foreground/40 text-xs">
                {m.updated_at
                  ? formatDateTimeCompact(m.updated_at)
                  : ''}
              </span>
              <button
                onClick={() => {
                  setEditingMember(m);
                  setShowForm(true);
                }}
                className="text-xs text-primary hover:opacity-70"
              >
                Voir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Import CSV */}
      {showCsvImport && (
        <CsvImportPanel
          voiceParts={voiceParts}
          seasons={seasons}
          onCloseAction={() => setShowCsvImport(false)}
          onSuccessAction={(newMembers) => {
            if (newMembers.length > 0) {
              setMembers((prev) => [...prev, ...newMembers]);
            }
            setShowCsvImport(false);
          }}
        />
      )}

      {/* Modal création/modification */}
      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) { setShowForm(false); setEditingMember(null); }
          }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {editingMember ? (
              <MemberForm
                key={editingMember.id}
                member={editingMember}
                voiceParts={voiceParts}
                currentUserRole={currentUserRole}
                isEmailConfirmed={!!localAuthMap[editingMember.id]?.emailConfirmedAt}
                onCloseAction={() => {
                  setShowForm(false);
                  setEditingMember(null);
                }}
                onSaveAction={handleSave}
                onPhotoUpdateAction={handlePhotoUpdate}
                seasons={seasons}
              />
            ) : (
              <CreateMemberForm
                voiceParts={voiceParts}
                seasons={seasons}
                onCloseAction={() => setShowForm(false)}
                onSuccessAction={handleSave}
              />
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <p className="text-xs text-foreground/40">
        {sorted.length} membre{sorted.length > 1 ? 's' : ''} affiché
        {sorted.length > 1 ? 's' : ''}
        {members.length !== sorted.length && ` sur ${members.length}`}
      </p>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-border relative">
        {/* Ombre gauche */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-20 bg-linear-to-r from-background/80 to-transparent" />
        )}
        {/* Ombre droite */}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-20 bg-linear-to-l from-background/80 to-transparent" />
        )}
        {/* Boutons de scroll */}
        {(canScrollLeft || canScrollRight) && (
          <div className="absolute top-2 right-2 z-30 flex gap-1">
            <button
              type="button"
              onClick={() => { tableScrollRef.current?.scrollBy({ left: -240, behavior: 'smooth' }); }}
              disabled={!canScrollLeft}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border bg-background text-foreground/60 hover:text-foreground hover:border-foreground/30 disabled:opacity-30 text-xs transition-all"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => { tableScrollRef.current?.scrollBy({ left: 240, behavior: 'smooth' }); }}
              disabled={!canScrollRight}
              className="w-7 h-7 flex items-center justify-center rounded-lg border border-border bg-background text-foreground/60 hover:text-foreground hover:border-foreground/30 disabled:opacity-30 text-xs transition-all"
            >
              →
            </button>
          </div>
        )}
        <div ref={tableScrollRef} className="overflow-x-auto" onScroll={updateScrollState}>
          <table ref={tableInnerRef} className="w-full text-sm">
            <thead>
              <tr className="bg-background-secondary border-b border-border">
                {selectionMode && <th className="pl-4 pr-1 py-3 w-8" />}
                <SortTh
                  label="Nom"
                  col="last_name"
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  nameFormat={nameFormat}
                  onToggleNameFormat={() => setNameFormat((f) => f === 'first_last' ? 'last_first' : 'first_last')}
                  className={selectionMode ? '' : 'sticky left-0 z-10 bg-background-secondary border-r border-border/40'}
                />
                <SortTh label="Pupitre" col="voice_part" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortTh label="Rôle" col="role" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/50">Contact</th>
                <SortTh label="Naissance" col="birthday" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/50">Adresse</th>
                <SortTh label="Modifié" col="updated" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/50">Connexion</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-foreground/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  authInfo={localAuthMap[member.id]}
                  onEditAction={() => {
                    setEditingMember(member);
                    setShowForm(true);
                  }}
                  onDeleteAction={() => handleDelete(member.id)}
                  onLockToggleAction={handleLockToggle}
                  nameFormat={nameFormat}
                  selectionMode={selectionMode}
                  checked={selectedIds.has(member.id)}
                  onToggleAction={() => toggleMember(member.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone dangereuse */}
      <div className="border border-red-200 dark:border-red-800 rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-xs font-medium text-red-500 dark:text-red-400 uppercase tracking-wide">Zone dangereuse</p>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Réinitialiser tous les mots de passe</p>
            <p className="text-xs text-foreground/40 mt-0.5">
              Génère un nouveau mot de passe pour chaque choriste confirmé et le leur envoie par email.
            </p>
          </div>
          <button
            onClick={handleBulkPasswordResetClick}
            disabled={bulkResetting}
            className="shrink-0 px-4 py-2 rounded-lg text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-40"
          >
            {bulkResetting ? 'Envoi en cours...' : 'Réinitialiser'}
          </button>
        </div>
        {bulkResetResult !== null && (
          <p className="text-xs text-primary">
            ✓ {bulkResetResult} choriste{bulkResetResult > 1 ? 's' : ''} ont reçu leur nouveau mot de passe.
          </p>
        )}
      </div>

    </div>
  );
}

function SortTh({
  label,
  col,
  sortKey,
  sortDir,
  onSort,
  nameFormat,
  onToggleNameFormat,
  className,
}: {
  label: string;
  col: SortKey;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  nameFormat?: NameFormat;
  onToggleNameFormat?: () => void;
  className?: string;
}) {
  const active = sortKey === col && sortDir !== 'default';
  const indicator = active ? (sortDir === 'asc' ? '↑' : '↓') : '↕';
  return (
    <th className={`px-4 py-3 text-left ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSort(col)}
          className={`flex items-center gap-1 text-xs font-medium transition-colors ${
            active ? 'text-primary' : 'text-foreground/50 hover:text-foreground'
          }`}
        >
          {label}
          <span className="text-[10px]">{indicator}</span>
        </button>
        {nameFormat && onToggleNameFormat && (
          <button
            type="button"
            onClick={onToggleNameFormat}
            title={nameFormat === 'first_last' ? 'Afficher Nom Prénom' : 'Afficher Prénom Nom'}
            className="text-[10px] text-foreground/30 hover:text-foreground/70 border border-foreground/20 rounded px-1 transition-colors"
          >
            {nameFormat === 'first_last' ? 'P N' : 'N P'}
          </button>
        )}
      </div>
    </th>
  );
}
