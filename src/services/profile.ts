// Profil użytkownika w Firestore. Reguły dostępu: firestore.rules.
//   users/{uid} – favoritePlaceIds (ulubione lokale), preferredTags („Czego szukam”, klucze z TAG_LABELS)
// uid jak w grupach: konto Google albo anonimowe w trybie demo.
import { arrayRemove, arrayUnion, doc, FirestoreError, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, ensureSignedIn } from './firebase';

export const MAX_FAVORITES = 100; // limit z firestore.rules
export const MAX_TAGS = 10;

export type UserProfile = {
  favoritePlaceIds: string[];
  preferredTags: string[];
};

// Brak dokumentu = pusty profil (tworzy się przy pierwszym zapisie)
export function subscribeProfile(uid: string, onChange: (p: UserProfile) => void, onError: (e: Error) => void) {
  return onSnapshot(
    doc(db, 'users', uid),
    snap => {
      const d = snap.data();
      onChange({ favoritePlaceIds: d?.favoritePlaceIds ?? [], preferredTags: d?.preferredTags ?? [] });
    },
    onError,
  );
}

// setDoc z merge: pierwszy zapis tworzy dokument, kolejne zmieniają tylko podane pola
async function saveProfile(data: Record<string, unknown>): Promise<void> {
  const uid = await ensureSignedIn();
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export function setFavorite(placeId: string, favorite: boolean): Promise<void> {
  return saveProfile({ favoritePlaceIds: favorite ? arrayUnion(placeId) : arrayRemove(placeId) });
}

export function setPreferredTags(tags: string[]): Promise<void> {
  return saveProfile({ preferredTags: tags });
}

// Komunikat do pokazania w UI
export function profileErrorMessage(e: unknown): string {
  const code = (e as FirestoreError)?.code;
  if (code === 'permission-denied') return 'Brak dostępu do profilu';
  if (code === 'unavailable') return 'Brak połączenia z internetem';
  return e instanceof Error ? e.message : 'Nieznany błąd';
}
