import { Place } from '../types/place';
import { isOpenNow } from './workingHours';

export type SortBy = 'distance' | 'rating';

export type PlaceFilters = {
  openNow: boolean;
  tags: string[];     // wybrane tagi – lokal musi mieć wszystkie
  sortBy: SortBy;
};

export const NO_FILTERS: PlaceFilters = { openNow: false, tags: [], sortBy: 'distance' };

export function activeFilterCount(f: PlaceFilters): number {
  return (f.openNow ? 1 : 0) + f.tags.length;
}

export function matchesFilters(p: Place, f: PlaceFilters): boolean {
  const tags = p.tags ?? [];
  if (f.openNow && isOpenNow(p.workingHours) !== true) return false;
  return f.tags.every(t => tags.includes(t));
}

// Lista lokali jest już posortowana po odległości (useNearbyPlaces)
export function sortPlaces(places: Place[], sortBy: SortBy): Place[] {
  if (sortBy === 'distance') return places;
  return [...places].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
}

// Ile lokali ma dany tag (do podpowiedzi w oknie wyboru tagów)
export function tagCounts(places: Place[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of places) for (const t of p.tags ?? []) counts[t] = (counts[t] ?? 0) + 1;
  return counts;
}
