// Osobny plik, żeby Firebase Auth (i AsyncStorage) ładował się tylko w trybie realnym.
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from './firebase';

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
