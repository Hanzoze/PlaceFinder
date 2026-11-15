import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AuthUser, DEMO_MODE, signInWithGoogle, signOutUser, subscribeAuth } from '../services/auth';

type AuthState = {
  user: AuthUser | null;
  initializing: boolean;
  busy: boolean;
  error: string | null;
  demo: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => subscribeAuth(u => {
    setUser(u);
    setInitializing(false);
  }), []);

  const signIn = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const u = await signInWithGoogle();
      if (u) setUser(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się zalogować');
    } finally {
      setBusy(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setBusy(true);
    try {
      await signOutUser();
      setUser(null);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, busy, error, demo: DEMO_MODE, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth musi być użyty wewnątrz AuthProvider');
  return ctx;
}
