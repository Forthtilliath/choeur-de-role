import { Suspense } from 'react';
import { EditableSection } from '@/components/editor/EditableSection';
import { NewsCard, NotificationsPopup } from '@/components/features/actualites';
import { NewsListClient } from '@/components/features/actualites/NewsListClient';
import { getNewsQuery } from '@/components/features/actualites/queries';
import { Skeleton } from '@/components/ui/Skeleton';
import { Main } from '@/components/ui/Main';
import { handlePageAccess } from '@/lib/auth';
import { getContentBlocks } from '@/lib/content';

async function IntroBlock({ canEdit }: { canEdit: boolean }) {
  const blocks = await getContentBlocks('actualites');
  return (
    <div className="mb-4 md:mb-8 p-6 rounded-2xl border border-border bg-background-secondary">
      <EditableSection
        page="actualites"
        blockKey="intro"
        initialContent={blocks.intro ?? ''}
        canEdit={canEdit}
      />
    </div>
  );
}

async function NewsSection() {
  const { pinned, regular, hasMore } = await getNewsQuery();
  const isEmpty = pinned.length === 0 && regular.length === 0;

  return (
    <>
      {isEmpty && (
        <p className="text-foreground/50 text-center py-12">Aucune actualité pour le moment.</p>
      )}
      {pinned.length > 0 && (
        <div className="flex flex-col gap-4 mb-4 md:mb-8">
          {pinned.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}
      {regular.length > 0 && (
        <div className="flex flex-col gap-4">
          <NewsListClient initial={regular} hasMore={hasMore} />
        </div>
      )}
    </>
  );
}

export default async function NewsPage() {
  const { isAdmin: canEdit } = await handlePageAccess();

  return (
    <Main variant="choriste" title="Actualités">
      <NotificationsPopup />

      <Suspense fallback={<Skeleton className="h-24 mb-4 md:mb-8" />}>
        <IntroBlock canEdit={canEdit} />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-primary overflow-hidden">
              <Skeleton className="h-9 rounded-none" />
              <Skeleton className="h-32 rounded-none" />
            </div>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        }
      >
        <NewsSection />
      </Suspense>
    </Main>
  );
}
