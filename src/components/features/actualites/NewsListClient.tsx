'use client';

import { useState, useTransition } from 'react';
import { NewsCard } from './NewsCard';
import { fetchMoreNews } from './actions';
import type { News } from './types';

type Props = {
  initial: News[];
  hasMore: boolean;
};

export function NewsListClient({ initial, hasMore: initialHasMore }: Props) {
  const [items, setItems] = useState<News[]>(initial);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const { news, hasMore: more } = await fetchMoreNews(items.length);
      setItems((prev) => [...prev, ...news]);
      setHasMore(more);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-6 py-2.5 rounded-full border border-border text-sm text-foreground/60 hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-50"
          >
            {isPending ? 'Chargement…' : 'Charger plus'}
          </button>
        </div>
      )}
    </>
  );
}
