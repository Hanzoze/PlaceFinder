// Logowanie przez Google -> Firebase Auth.
// Bez EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID działa tryb demo (fałszywy użytkownik),
// żeby aplikacja ruszała w Expo Go, zanim skonfigurujemy Firebase i dev build.
// Moduły natywne ładujemy dynamicznie: import na górze pliku wywaliłby Expo Go.

export type AuthUser = {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  isDemo: boolean;
};

export const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
export const DEMO_MODE = !WEB_CLIENT_ID;

export const DEMO_USER: AuthUser = {
  uid: 'demo',
  name: 'Student PWr (demo)',
  email: 'student@student.pwr.edu.pl',
  photoURL: null,
  isDemo: true,
};

let configured = false;

async function google() {
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
  if (!configured) {
    GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });
    configured = true;
  }
  return GoogleSignin;
}

async function firebaseAuth() {
  const authLib = await import('firebase/auth');
  const { auth } = await import('./firebaseAuth');
  return { ...authLib, auth };
}

function toAuthUser(u: { uid: string; displayName: string | null; email: string | null; photoURL: string | null }): AuthUser {
  return { uid: u.uid, name: u.displayName ?? 'Użytkownik', email: u.email ?? '', photoURL: u.photoURL, isDemo: false };
}

/** Subskrypcja zmian sesji. Zwraca funkcję odpinającą. */
export function subscribeAuth(cb: (u: AuthUser | null) => void): () => void {
  if (DEMO_MODE) {
    cb(null);
    return () => {};
  }
  let unsub = () => {};
  let cancelled = false;
  firebaseAuth().then(({ auth, onAuthStateChanged }) => {
    if (cancelled) return;
    unsub = onAuthStateChanged(auth, u => cb(u ? toAuthUser(u) : null));
  });
  return () => { cancelled = true; unsub(); };
}

/** Zwraca użytkownika albo null, gdy anulowano. W trybie realnym stan i tak przyjdzie z subscribeAuth. */
export async function signInWithGoogle(): Promise<AuthUser | null> {
  if (DEMO_MODE) return DEMO_USER;
  const GoogleSignin = await google();
  await GoogleSignin.hasPlayServices();
  const res = await GoogleSignin.signIn();
  const idToken = res.data?.idToken;
  if (!idToken) return null;
  const { auth, GoogleAuthProvider, signInWithCredential } = await firebaseAuth();
  const cred = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  return toAuthUser(cred.user);
}

export async function signOutUser(): Promise<void> {
  if (DEMO_MODE) return;
  const GoogleSignin = await google();
  const { auth, signOut } = await firebaseAuth();
  await GoogleSignin.signOut();
  await signOut(auth);
}
