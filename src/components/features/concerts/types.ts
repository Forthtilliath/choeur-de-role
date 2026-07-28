import { Tables, TablesInsert, TablesUpdate } from '@/types/database';
import { Merge } from '@/types/utils';

export type RepresentationFile = Tables<'representation_files'>;

export type Season = Tables<'seasons'>;

export type PerformanceDate = Tables<'performance_dates'>;

export type Performance = Tables<'performances'>;

export type PerformanceDatesWithSeasons = Merge<
  Tables<'performances'> & {
    performance_dates: PerformanceDate[];
    seasons: Pick<Season, 'label'> | null;
  }
>;

export type PerformanceWithDates = Tables<'performances'> & {
  performance_dates: Tables<'performance_dates'>[];
};

export type PerformanceTitle = Pick<Performance, 'id' | 'title'>;

export type SeasonWithPerformancesWithDates = Season & {
  performances: PerformanceWithDates[];
};

export type PerformanceInsert = TablesInsert<'performances'>;
export type PerformanceUpdate = TablesUpdate<'performances'>;
