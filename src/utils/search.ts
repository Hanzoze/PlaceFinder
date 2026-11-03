import { Place } from '../types/place';

const PL_CHARS: Record<string, string> = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };

// Małe litery bez polskich znaków, żeby "sklodowskiej" znalazło "Skłodowskiej"
function normalize(s: string): string {
  return s.toLowerCase().replace(/[ąćęłńóśźż]/g, ch => PL_CHARS[ch]);
}

// Każde słowo z zapytania musi wystąpić w nazwie albo adresie
export function matchesQuery(place: Place, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const haystack = normalize(`${place.name} ${place.address}`);
  return words.every(w => haystack.includes(w));
}
