'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useNow } from '@/hooks/useNow';

import type { Season } from '../../concerts';
import type { AdminMemberWithSeasons, AuthInfo, VoicePart } from '../types';

import { BulkPasswordResetZone } from './BulkPasswordResetZone';
import { RECENT_MS } from './constants';
import { CsvImportPanel } from './CsvImportPanel';
import { exportMembersCsv } from './exportMembersCsv';
import { MemberFormModal } from './MemberFormModal';
import { filterMembers, ROLE_GROUPS, sortMembers } from './membersList';
import { MembersSelectionBar } from './MembersSelectionBar';
import { MembersTable } from './MembersTable';
import { MembersToolbar } from './MembersToolbar';
import { RecentUpdatesPanel } from './RecentUpdatesPanel';
import { useMembersData } from './useMembersData';
import { useMemberSelection } from './useMemberSelection';
import { useMemberSort } from './useMemberSort';

type Props = {
  initialMembers: AdminMemberWithSeasons[];
  voiceParts: VoicePart[];
  currentUserRole: string;
  authMap: Record<string, AuthInfo>;
  seasons: Season[];
};

// Ajoute ou retire une clé, sans jamais vider complètement l'ensemble
function toggleKeepingOne(prev: Set<string>, key: string) {
  const next = new Set(prev);
  if (next.has(key)) {
    if (next.size === 1) return prev;
    next.delete(key);
  } else next.add(key);
  return next;
}

function plural(count: number) {
  return count > 1 ? 's' : '';
}

export function MembresAdminClient({
  initialMembers,
  voiceParts,
  currentUserRole,
  authMap,
  seasons,
}: Props) {
  const {
    members,
    localAuthMap,
    upsertMember,
    addMembers,
    updatePhoto,
    setLocked,
    removeMember,
    assignSeason,
  } = useMembersData(initialMembers, authMap, seasons);
  const [search, setSearch] = useState('');
  const [selectedVoicePartIds, setSelectedVoicePartIds] = useState<Set<string>>(
    () => new Set(voiceParts.map((vp) => vp.id)),
  );
  const [showForm, setShowForm] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminMemberWithSeasons | null>(null);
  const [showRecent, setShowRecent] = useState(false);
  const now = useNow();
  const [filterSeasonId, setFilterSeasonId] = useState('');
  const [showLocked, setShowLocked] = useState(false);
  const [selectedRoleGroups, setSelectedRoleGroups] = useState<Set<string>>(
    () => new Set(ROLE_GROUPS.map((g) => g.key)),
  );
  const { sortKey, sortDir, nameFormat, handleSort, toggleNameFormat } = useMemberSort();

  const filtered = useMemo(
    () =>
      filterMembers(
        members,
        {
          search,
          voicePartIds: selectedVoicePartIds,
          seasonId: filterSeasonId,
          showLocked,
          roleGroups: selectedRoleGroups,
        },
        localAuthMap,
      ),
    [
      members,
      search,
      selectedVoicePartIds,
      filterSeasonId,
      showLocked,
      localAuthMap,
      selectedRoleGroups,
    ],
  );

  const sorted = useMemo(
    () => sortMembers(filtered, sortKey, sortDir, nameFormat),
    [filtered, sortKey, sortDir, nameFormat],
  );

  const {
    selectionMode,
    selectedIds,
    allChecked,
    someSelected,
    toggleSelectionMode,
    toggleMember,
    toggleAll,
  } = useMemberSelection(sorted);

  async function copySelectedEmails() {
    const selectedMembers = members.filter((m) => selectedIds.has(m.id) && m.email);
    const entries = selectedMembers.map((m) => {
      const name = [m.first_name, m.last_name].filter(Boolean).join(' ');
      return name ? `${name} <${m.email}>` : m.email!;
    });
    await navigator.clipboard.writeText(entries.join(', '));
    toast.success(
      `${entries.length} email${plural(entries.length)} copié${plural(entries.length)}`,
      {
        description: 'Collez directement dans le champ CCI de votre messagerie.',
      },
    );
  }

  const recentlyUpdatedBySelf = useMemo(
    () =>
      members.filter(
        (m) => m.self_updated_at && now - new Date(m.self_updated_at).getTime() < RECENT_MS,
      ),
    [members, now],
  );

  function openEditForm(member: AdminMemberWithSeasons) {
    setEditingMember(member);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingMember(null);
  }

  function handleSave(member: AdminMemberWithSeasons) {
    upsertMember(member);
    closeForm();
  }

  return (
    <div className="flex flex-col gap-6">
      <MembersToolbar
        search={search}
        onSearchChangeAction={setSearch}
        selectionMode={selectionMode}
        onToggleSelectionModeAction={toggleSelectionMode}
        onExportAction={() => exportMembersCsv(members, seasons)}
        onToggleCsvImportAction={() => {
          setShowForm(false);
          setShowCsvImport((v) => !v);
        }}
        onAddMemberAction={() => {
          setShowCsvImport(false);
          setEditingMember(null);
          setShowForm(true);
        }}
        voiceParts={voiceParts}
        selectedVoicePartIds={selectedVoicePartIds}
        onToggleVoicePartAction={(id) =>
          setSelectedVoicePartIds((prev) => toggleKeepingOne(prev, id))
        }
        selectedRoleGroups={selectedRoleGroups}
        onToggleRoleGroupAction={(key) =>
          setSelectedRoleGroups((prev) => toggleKeepingOne(prev, key))
        }
        seasons={seasons}
        filterSeasonId={filterSeasonId}
        onFilterSeasonChangeAction={setFilterSeasonId}
        showLocked={showLocked}
        onToggleShowLockedAction={() => setShowLocked((v) => !v)}
        recentCount={recentlyUpdatedBySelf.length}
        showRecent={showRecent}
        onToggleShowRecentAction={() => setShowRecent((v) => !v)}
      />

      {selectionMode && (
        <MembersSelectionBar
          selectedCount={selectedIds.size}
          allChecked={allChecked}
          someSelected={someSelected}
          onToggleAllAction={toggleAll}
          onCopyEmailsAction={copySelectedEmails}
          seasons={seasons}
          onBulkAssignSeasonAction={(seasonId) => assignSeason(selectedIds, seasonId)}
        />
      )}

      {showRecent && recentlyUpdatedBySelf.length > 0 && (
        <RecentUpdatesPanel members={recentlyUpdatedBySelf} onViewAction={openEditForm} />
      )}

      {showCsvImport && (
        <CsvImportPanel
          voiceParts={voiceParts}
          seasons={seasons}
          onCloseAction={() => setShowCsvImport(false)}
          onSuccessAction={(newMembers) => {
            addMembers(newMembers);
            setShowCsvImport(false);
          }}
        />
      )}

      {showForm && (
        <MemberFormModal
          editingMember={editingMember}
          isEmailConfirmed={!!(editingMember && localAuthMap[editingMember.id]?.emailConfirmedAt)}
          voiceParts={voiceParts}
          seasons={seasons}
          currentUserRole={currentUserRole}
          onCloseAction={closeForm}
          onSaveAction={handleSave}
          onPhotoUpdateAction={updatePhoto}
        />
      )}

      {/* Stats */}
      <p className="text-xs text-foreground/40">
        {sorted.length} membre{plural(sorted.length)} affiché
        {plural(sorted.length)}
        {members.length !== sorted.length && ` sur ${members.length}`}
      </p>

      <MembersTable
        members={sorted}
        authMap={localAuthMap}
        selectionMode={selectionMode}
        selectedIds={selectedIds}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortAction={handleSort}
        nameFormat={nameFormat}
        onToggleNameFormatAction={toggleNameFormat}
        onEditAction={openEditForm}
        onDeleteAction={removeMember}
        onLockToggleAction={setLocked}
        onToggleMemberAction={toggleMember}
      />

      <BulkPasswordResetZone />
    </div>
  );
}
