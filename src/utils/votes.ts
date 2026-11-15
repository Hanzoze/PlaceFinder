import { Vote, VoteResult } from '../types/group';

// Wszystkie zaproponowane lokale (także z 0 głosów), od najwięcej głosów; przy remisie kolejność propozycji.
export function tallyVotes(placeIds: string[], votes: Vote[]): VoteResult[] {
  const results = placeIds.map(placeId => ({
    placeId,
    count: 0,
    voterIds: [] as string[],
  }));
  for (const v of votes) {
    const r = results.find(x => x.placeId === v.placeId);
    if (!r) continue;
    r.count++;
    r.voterIds.push(v.userId);
  }
  return results
    .map((r, order) => ({ r, order }))
    .sort((a, b) => b.r.count - a.r.count || a.order - b.order)
    .map(({ r }) => r);
}

// Lokale z największą liczbą głosów (kilka przy remisie, pusta lista gdy nikt nie głosował).
export function winners(results: VoteResult[]): string[] {
  const max = Math.max(0, ...results.map(r => r.count));
  return max === 0 ? [] : results.filter(r => r.count === max).map(r => r.placeId);
}
