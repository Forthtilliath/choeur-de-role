'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { getPastPerformances, getUpcomingPerformances } from '@/utils/performanceHelpers';
import { ConcertsList } from './ConcertsList';
import { NoConcertsPlaceholder } from './NoConcertsPlaceholder';
import type { PerformanceDatesWithSeasons } from './types';

export function ConcertsClient({ performances }: { performances: PerformanceDatesWithSeasons[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get('q') ?? '';
  const selectedSeasonId = searchParams.get('saison') ?? null;
  const [searchInput, setSearchInput] = useState(search);

  function setParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // Sync input → URL (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (searchInput) params.set('q', searchInput);
      else params.delete('q');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, pathname, router]);

  const seasons = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of performances) {
      if (p.season_id && p.seasons?.label) map.set(p.season_id, p.seasons.label);
    }
    return [...map.entries()].sort((a, b) => b[1].localeCompare(a[1]));
  }, [performances]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return performances.filter((p) => {
      const matchSearch = !q || p.title.toLowerCase().includes(q);
      const matchSeason = !selectedSeasonId || p.season_id === selectedSeasonId;
      return matchSearch && matchSeason;
    });
  }, [performances, search, selectedSeasonId]);

  const now = new Date();
  const upcoming = getUpcomingPerformances(filtered, now);
  const past = getPastPerformances(filtered, now);
  const hasFilters = search.trim() !== '' || selectedSeasonId !== null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un concert..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setParams({ q: null }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {seasons.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setParams({ saison: null })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                !selectedSeasonId
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
              }`}
            >
              Toutes
            </button>
            {seasons.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setParams({ saison: selectedSeasonId === id ? null : id })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedSeasonId === id
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-foreground/60 hover:border-primary/40 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {upcoming.length > 0 ? (
        <ConcertsList performances={upcoming} title="À venir" />
      ) : !hasFilters ? (
        <NoConcertsPlaceholder
          message="Aucun concert à venir pour le moment."
          buttonHref="/contact"
          buttonText="Nous contacter"
        />
      ) : null}

      {past.length > 0 && <ConcertsList performances={past} title="Concerts passés" isPast />}

      {upcoming.length === 0 && past.length === 0 && hasFilters && (
        <p className="text-foreground/50 text-sm text-center py-16">
          Aucun concert ne correspond à cette recherche.
        </p>
      )}
    </div>
  );
}
