// `firebase/auth` w runtime (Metro, warunek react-native) eksportuje getReactNativePersistence,
// ale jego typy tego nie pokazują, więc dopisujemy deklarację.
import type { Persistence, ReactNativeAsyncStorage } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: ReactNativeAsyncStorage): Persistence;
}
