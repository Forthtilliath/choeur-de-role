import { filterBy, sortBy, getMinDate, getMaxDate } from '@/utils/arrayHelpers';

type WithDates<T> = T & {
  performance_dates: { date: string }[];
};

export function getUpcomingPerformances<T>(
  performances: WithDates<T>[],
  now: Date = new Date(),
): WithDates<T>[] {
  return sortBy(
    filterBy(performances, (p) => p.performance_dates.some((d) => new Date(d.date) >= now)),
    (p) => getMinDate(p.performance_dates, (d) => new Date(d.date))?.getTime() ?? Infinity,
  );
}

export function getPastPerformances<T>(
  performances: WithDates<T>[],
  now: Date = new Date(),
): WithDates<T>[] {
  return sortBy(
    filterBy(performances, (p) => p.performance_dates.every((d) => new Date(d.date) < now)),
    (p) => getMaxDate(p.performance_dates, (d) => new Date(d.date))?.getTime() ?? -Infinity,
    true,
  );
}

export function sortPerformanceDates<T extends { date: string }>(dates: T[]): T[] {
  return [...dates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
