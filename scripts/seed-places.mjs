// Wgrywa lokale z data/places.csv (wiersze z include=1) do Firestore, kolekcja `places`.
// CSV jest źródłem prawdy: dokument w bazie jest nadpisywany, a lokale bez include=1 są z bazy usuwane.
// Uruchom: npm run seed   (potrzebny klucz admina, domyślnie ../secrets/placefinder-admin.json)
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DAYS, parseCsv } from './csv.mjs';

const TAGS = ['wifi', 'sockets', 'quiet', 'laptop_friendly'];

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? resolve('../secrets/placefinder-admin.json');
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const num = v => (v === '' ? undefined : Number(v));
const str = v => v || undefined;

function toDoc(r, line) {
  const latitude = Number(r.latitude);
  const longitude = Number(r.longitude);
  if (!r.id || !r.name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error(`Wiersz ${line}: brak id, nazwy albo współrzędnych`);
  }
  const tags = r.tags.split(/\s+/).filter(Boolean);
  const unknown = tags.filter(t => !TAGS.includes(t));
  if (unknown.length) throw new Error(`Wiersz ${line} (${r.name}): nieznane tagi ${unknown.join(', ')}. Dozwolone: ${TAGS.join(', ')}`);

  const workingHours = Object.fromEntries(DAYS.filter(d => r[d]).map(d => [d, r[d]]));
  return {
    name: r.name,
    address: r.address,
    latitude,
    longitude,
    rating: num(r.rating),
    reviewCount: num(r.review_count),
    priceFromPln: num(r.price_from_pln),
    priceToPln: num(r.price_to_pln),
    tags,
    categories: r.categories.split(';').map(s => s.trim()).filter(Boolean),
    phone: str(r.phone),
    website: str(r.website),
    mapsUrl: str(r.maps_url),
    photoUrl: str(r.photo_url),
    workingHours: Object.keys(workingHours).length ? workingHours : undefined,
  };
}

const rows = parseCsv(readFileSync('data/places.csv', 'utf8'));
const included = rows
  .map((r, i) => ({ r, line: i + 2 }))
  .filter(({ r }) => r.include === '1')
  .map(({ r, line }) => ({ id: r.id, doc: toDoc(r, line) }));

const places = db.collection('places');
const keep = new Set(included.map(p => p.id));
const stale = (await places.listDocuments()).filter(ref => !keep.has(ref.id));

const batch = db.batch();
for (const { id, doc } of included) batch.set(places.doc(id), doc);
for (const ref of stale) batch.delete(ref);
await batch.commit();

console.log(`Wgrano ${included.length} lokali, usunięto ${stale.length} nieaktualnych.`);
