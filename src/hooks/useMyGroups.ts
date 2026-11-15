import { useEffect, useState } from 'react';
import { ensureSignedIn } from '../services/firebase';
import { groupErrorMessage, subscribeMyGroups } from '../services/groups';
import { Group } from '../types/group';

// Grupy, w których jestem, na żywo (nowa grupa / dołączenie pojawia się od razu), najnowsze pierwsze
export function useMyGroups() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    const fail = (e: unknown) => active && setError(groupErrorMessage(e));

    ensureSignedIn()
      .then(uid => {
        if (active) unsub = subscribeMyGroups(uid, setGroups, fail);
      })
      .catch(fail);

    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  return { groups: groups ?? [], loading: groups === null && !error, error };
}
