import { useEffect, useState } from 'react';
import { ensureSignedIn } from '../services/firebase';
import {
  MAX_FAVORITES, MAX_TAGS, profileErrorMessage, setFavorite, setPreferredTags, subscribeProfile, UserProfile,
} from '../services/profile';

// Mój profil (ulubione, „Czego szukam”) na żywo: zmianę na Szczegółach od razu widać w Profilu
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    const fail = (e: unknown) => active && setError(profileErrorMessage(e));

    ensureSignedIn()
      .then(uid => {
        if (active) unsub = subscribeProfile(uid, setProfile, fail);
      })
      .catch(fail);

    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  const favoriteIds = profile?.favoritePlaceIds ?? [];
  const preferredTags = profile?.preferredTags ?? [];
  const report = (e: unknown) => setError(profileErrorMessage(e));

  const toggleFavorite = (placeId: string) => {
    const favorite = favoriteIds.includes(placeId);
    if (!favorite && favoriteIds.length >= MAX_FAVORITES) {
      setError(`Można mieć najwyżej ${MAX_FAVORITES} ulubionych`);
      return;
    }
    setError(null);
    setFavorite(placeId, !favorite).catch(report);
  };

  const toggleTag = (tag: string) => {
    const selected = preferredTags.includes(tag);
    if (!selected && preferredTags.length >= MAX_TAGS) {
      setError(`Można wybrać najwyżej ${MAX_TAGS} tagów`);
      return;
    }
    const next = selected ? preferredTags.filter(t => t !== tag) : [...preferredTags, tag];
    setError(null);
    setPreferredTags(next).catch(report);
  };

  return {
    favoriteIds,
    preferredTags,
    loading: profile === null && !error,
    error,
    isFavorite: (placeId: string) => favoriteIds.includes(placeId),
    toggleFavorite,
    toggleTag,
  };
}
