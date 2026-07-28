import { CarteWrapper } from '@/components/features/carte/CarteWrapper';
import { getMembersForMap, getMembersForMapAdmin } from '@/components/features/carte/queries';
import { getContentBlocks } from '@/lib/content';
import { handlePageAccess, getUserQuery, isCa } from '@/lib/auth';

export default async function CartePage() {
  await handlePageAccess();
  const { role } = await getUserQuery();
  const canSeeAll = isCa(role);

  const [members, blocks] = await Promise.all([
    canSeeAll ? getMembersForMapAdmin() : getMembersForMap(),
    getContentBlocks('carte'),
  ]);
  const center = {
    lat: parseFloat(blocks.center_lat ?? '47.445717'),
    lng: parseFloat(blocks.center_lng ?? '-0.537951'),
    label: blocks.center_label ?? '♪♫ Chœur de Rôle ♫♪',
  };

  return (
    <main className="flex flex-col h-main-visitor lg:h-main-chorister">
      <div className="p-2 flex items-center justify-between border-b border-border bg-background shrink-0">
        <div>
          <p className="text-xs text-foreground/70">
            {members.length} choriste{members.length > 1 ? 's' : ''} géolocalisé
            {members.length > 1 ? 's' : ''}
          </p>
        </div>
        <p className="text-xs text-foreground/60 max-w-md text-right hidden sm:block">
          {canSeeAll
            ? 'Vue CA — tous les choristes géolocalisés avec coordonnées complètes.'
            : 'Seuls les choristes ayant partagé leur adresse apparaissent sur cette carte.'}
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <CarteWrapper membres={members} center={center} />
      </div>
    </main>
  );
}
