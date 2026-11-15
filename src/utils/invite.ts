import * as Linking from 'expo-linking';
import { normalizeCode } from '../services/groups';

// Link do udostępnienia (np. przez Share.share). W Expo Go wygląda jak exp://.../--/join?code=K7P2QX,
// w zbudowanej aplikacji placefinder://join?code=K7P2QX
export function inviteLink(code: string): string {
  return Linking.createURL('join', { queryParams: { code } });
}

export function inviteMessage(groupName: string, code: string): string {
  return `Dołącz do grupy „${groupName}” w PlaceFinder: ${inviteLink(code)}\nAlbo wpisz kod: ${code}`;
}

// Kod z otwartego linku zaproszenia albo null, jeśli to nie jest link zaproszenia
export function codeFromLink(url: string): string | null {
  const { path, queryParams } = Linking.parse(url);
  const code = queryParams?.code;
  if (path !== 'join' || typeof code !== 'string') return null;
  return normalizeCode(code) || null;
}
