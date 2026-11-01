// Jednorazowo zbiera kandydatów z RapidAPI (Maps Data) wokół kampusu PWr do data/places.csv.
// Uruchom: npm run collect   (potrzebny RAPIDAPI_KEY w .env, zużywa 1 zapytanie na frazę z QUERIES)
// Uwaga: nadpisuje data/places.csv, więc ręczne poprawki (tagi, ceny) przepadną.
import { mkdirSync, writeFileSync } from 'node:fs';
import { DAYS, toCsv } from './csv.mjs';

const KEY = process.env.RAPIDAPI_KEY;
const HOST = 'maps-data.p.rapidapi.com';
const CAMPUS = { latitude: 51.1079, longitude: 17.0614 };
const QUERIES = ['kawiarnia', 'restauracja', 'bistro', 'bar mleczny'];
const MAX_DISTANCE_M = 1500;
const PICK = 30;
const MIN_RATING = 4.0;
const MIN_REVIEWS = 30;

function distanceM(a, b) {
  const toRad = d => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371000 * Math.asin(Math.sqrt(h)));
}

async function search(query) {
  const params = new URLSearchParams({
    query, lat: String(CAMPUS.latitude), lng: String(CAMPUS.longitude),
    limit: '60', country: 'pl', lang: 'pl', zoom: '15',
  });
  const res = await fetch(`https://${HOST}/searchmaps.php?${params}`, {
    headers: { 'x-rapidapi-key': KEY, 'x-rapidapi-host': HOST },
  });
  if (!res.ok) throw new Error(`RapidAPI ${res.status}: ${await res.text()}`);
  return (await res.json()).data ?? [];
}

function toRow(raw, query) {
  const hours = raw.working_hours ?? {};
  const pick = day => {
    const v = hours[day];
    return Array.isArray(v) ? v.join(', ') : v ?? '';
  };
  return {
    include: '0',
    id: raw.place_id ?? raw.business_id,
    name: raw.name,
    address: raw.full_address_array?.join(', ') ?? raw.full_address ?? '',
    latitude: raw.latitude,
    longitude: raw.longitude,
    distance_m: distanceM(CAMPUS, raw),
    rating: raw.rating ?? '',
    review_count: raw.review_count ?? '',
    price_from_pln: '',
    price_to_pln: '',
    tags: '',
    categories: (raw.types ?? []).join('; '),
    phone: raw.phone_number ?? '',
    website: raw.website ?? '',
    maps_url: raw.place_link ?? '',
    photo_url: raw.photos?.[0]?.src?.replace(/=w\d+-h\d+-k-no$/, '=w600-h400-k-no') ?? '',
    ...Object.fromEntries(DAYS.map(d => [d, pick(d)])),
    source_query: query,
  };
}

// Połowa kawiarni (do siedzenia z laptopem), połowa jedzenia; w każdej grupie najbliższe dobrze oceniane.
function markIncluded(rows) {
  const good = rows.filter(r => r.rating >= MIN_RATING && r.review_count >= MIN_REVIEWS);
  const cafes = good.filter(r => r.source_query === 'kawiarnia');
  const food = good.filter(r => r.source_query !== 'kawiarnia');
  const chosen = [...cafes.slice(0, PICK / 2), ...food.slice(0, PICK / 2)];
  for (const r of good) {
    if (chosen.length >= PICK) break;
    if (!chosen.includes(r)) chosen.push(r);
  }
  chosen.forEach(r => { r.include = '1'; });
}

if (!KEY) {
  console.error('Brak RAPIDAPI_KEY w .env');
  process.exit(1);
}

const byId = new Map();
for (const query of QUERIES) {
  const results = await search(query);
  console.log(`${query}: ${results.length} wyników`);
  for (const raw of results) {
    if (raw.is_permanently_closed || raw.is_temporarily_closed) continue;
    const row = toRow(raw, query);
    if (!row.id || !Number.isFinite(row.latitude) || row.distance_m > MAX_DISTANCE_M) continue;
    if (!byId.has(row.id)) byId.set(row.id, row);
  }
}

const rows = [...byId.values()].sort((a, b) => a.distance_m - b.distance_m);
markIncluded(rows);

mkdirSync('data', { recursive: true });
writeFileSync('data/places.csv', toCsv(rows));
console.log(`Zapisano ${rows.length} kandydatów do data/places.csv, include=1 ma ${rows.filter(r => r.include === '1').length}.`);
