import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig';

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Sesja w AsyncStorage: ten sam telefon = to samo konto (uid) po restarcie aplikacji
export const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

// Zalogowany przez Google -> jego uid. Bez logowania (tryb demo) -> konto anonimowe.
// Grupy i głosy są przypisane do uid.
export async function ensureSignedIn(): Promise<string> {
  await auth.authStateReady();
  if (auth.currentUser) return auth.currentUser.uid;
  const { user } = await signInAnonymously(auth);
  return user.uid;
}
