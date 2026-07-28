import { Suspense } from 'react';
import { getPerformanceFromSeasons } from '@/components/features/concerts';
import { getVoiceParts } from '@/components/features/pupitres/queries';
import { RepertoireClient } from '@/components/features/repertoire/RepertoireClient';
import { getMemberWithSeasons } from '@/components/features/repertoire/queries';
import type { Song } from '@/components/features/repertoire/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';
import { sortByOrderIndex } from '@/utils/arrayHelpers';

async function RepertoireContent({
  memberSeasons,
  voicePartId,
}: {
  memberSeasons: Awaited<ReturnType<typeof getMemberWithSeasons>>['member_seasons'];
  voicePartId: string | null;
}) {
  const [performances, voiceParts] = await Promise.all([
    getPerformanceFromSeasons(memberSeasons),
    getVoiceParts(),
  ]);

  const songsMap = new Map<string, NonNullable<Song>>();
  performances.forEach((perf) => {
    perf.songs.forEach((sp) => {
      if (sp.song) songsMap.set(sp.song.id, sp.song);
    });
  });
  const songs = sortByOrderIndex(Array.from(songsMap.values()));

  return (
    <>
      {songs.length === 0 && (
        <div className="text-center py-12 text-foreground/50">
          <p>Aucun chant disponible pour votre saison.</p>
        </div>
      )}
      <RepertoireClient
        songs={songs}
        voiceParts={voiceParts}
        myVoicePartId={voicePartId}
        performances={performances.map((p) => {
          const dates = p.performance_dates.map((d) => d.date).sort();
          return {
            id: p.id,
            title: p.title,
            songIds: (p.songs ?? []).map((s) => s.song?.id).filter(Boolean) as string[],
            minDate: dates[0] ?? null,
            notes: p.notes ?? null,
            files: [...(p.representation_files ?? [])]
              .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
              .map(({ id, label, file_url }) => ({ id, label, file_url })),
          };
        })}
      />
    </>
  );
}

export default async function RepertoirePage() {
  const user = await getMemberWithSeasons();

  return (
    <Main variant="choriste" title="Répertoire">
      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="h-10" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          </div>
        }
      >
        <RepertoireContent memberSeasons={user.member_seasons} voicePartId={user.voice_part_id} />
      </Suspense>
    </Main>
  );
}
