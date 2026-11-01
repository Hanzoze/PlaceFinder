import { Place, PriceLevel } from '../types/place';
import { PLACES } from '../data/places';
import { Coords } from './geo';

const API_KEY = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
const HOST = 'maps-data.p.rapidapi.com';

function mapPriceLevel(raw?: string | null): PriceLevel | undefined {
  if (!raw) return undefined;
  const n = (raw.match(/\$/g) ?? []).length;
  return (['PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE',
           'PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE'] as const)[n - 1];
}

function parsePlnRange(raw?: string | null): { from?: number; to?: number } {
  if (!raw || !/zł/i.test(raw)) return {};
  const nums = raw.match(/\d+/g)?.map(Number) ?? [];
  return { from: nums[0], to: nums[1] ?? nums[0] };
}

function biggerPhoto(src?: string): string | undefined {
  return src?.replace(/=w\d+-h\d+-k-no$/, '=w600-h400-k-no');
}

function toPlace(raw: any): Place {
  const range = parsePlnRange(raw.price_level);
  return {
    id: raw.place_id ?? raw.business_id,
    name: raw.name ?? 'Bez nazwy',
    address: raw.full_address_array?.join(', ') ?? raw.full_address ?? '',
    latitude: raw.latitude,
    longitude: raw.longitude,
    priceLevel: mapPriceLevel(raw.price_level),
    priceFromPln: range.from,
    priceToPln: range.to,
    rating: raw.rating ?? undefined,
    reviewCount: raw.review_count ?? undefined,
    categories: raw.types ?? [],
    workingHours: raw.working_hours ?? undefined,
    photoUrl: biggerPhoto(raw.photos?.[0]?.src),
    phone: raw.phone_number ?? undefined,
    website: raw.website ?? undefined,
    mapsUrl: raw.place_link ?? undefined,
  };
}

export async function fetchNearbyPlaces(center: Coords, query = 'restauracja'): Promise<Place[]> {
  if (!API_KEY) {
    console.warn('Brak EXPO_PUBLIC_RAPIDAPI_KEY – używam danych testowych');
    return PLACES;
  }

  const params = new URLSearchParams({
    query,
    lat: String(center.latitude),
    lng: String(center.longitude),
    limit: '20',
    country: 'pl',
    lang: 'pl',
    zoom: '15',
  });

  const res = await fetch(`https://${HOST}/searchmaps.php?${params}`, {
    headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': HOST },
  });
  if (!res.ok) throw new Error(`RapidAPI ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return (json.data ?? [])
    .filter((p: any) => !p.is_permanently_closed && !p.is_temporarily_closed)
    .map(toPlace);
}