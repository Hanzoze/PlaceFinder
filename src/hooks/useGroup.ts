import { useEffect, useState } from 'react';
import { ensureSignedIn } from '../services/firebase';
import { groupErrorMessage, subscribeGroup, subscribeVotes } from '../services/groups';
import { Group, Vote } from '../types/group';
import { tallyVotes, winners } from '../utils/votes';

// Stany oznaczone groupId, żeby po zmianie grupy nie pokazać danych poprzedniej
// (i żeby nie wołać setState synchronicznie w useEffect)
type Tagged<T> = { groupId: string; value: T };

// Grupa i głosy na żywo: każda zmiana (nowy członek, propozycja, głos) od razu trafia do wszystkich telefonów
export function useGroup(groupId: string) {
  const [group, setGroup] = useState<Tagged<Group | null> | null>(null);
  const [votes, setVotes] = useState<Tagged<Vote[]> | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [error, setError] = useState<Tagged<string> | null>(null);

  useEffect(() => {
    let active = true;
    const unsubs: (() => void)[] = [];
    const fail = (e: unknown) => active && setError({ groupId, value: groupErrorMessage(e) });

    ensureSignedIn()
      .then(me => {
        if (!active) return;
        setUid(me);
        unsubs.push(subscribeGroup(groupId, g => setGroup({ groupId, value: g }), fail));
        unsubs.push(subscribeVotes(groupId, v => setVotes({ groupId, value: v }), fail));
      })
      .catch(fail);

    return () => {
      active = false;
      unsubs.forEach(u => u());
    };
  }, [groupId]);

  const current = <T,>(t: Tagged<T> | null) => (t?.groupId === groupId ? t.value : undefined);
  const g = current(group) ?? null;
  const v = current(votes) ?? [];
  const err = current(error) ?? null;
  const results = tallyVotes(g?.placeIds ?? [], v);

  return {
    group: g,
    votes: v,
    results,                                              // od najwięcej głosów
    winners: winners(results),                            // placeId zwycięzców (kilka przy remisie)
    myVote: v.find(x => x.userId === uid)?.placeId ?? null,
    uid,
    isOwner: !!g && g.createdBy === uid,
    loading: !err && (current(group) === undefined || current(votes) === undefined),
    error: err,
  };
}
