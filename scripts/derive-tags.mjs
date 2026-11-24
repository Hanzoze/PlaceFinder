// Dopisuje do data/places.csv tagi, które da się wyliczyć z danych (kategorie, godziny, ocena).
// Tagi wpisane ręcznie (wifi, sockets, quiet, laptop_friendly) zostają. Wyliczone są liczone od nowa.
// Uruchom: npm run tags   (potem npm run seed, żeby trafiły do bazy)
import { readFileSync, writeFileSync } from 'node:fs';
import { DAYS, parseCsv, toCsv } from './csv.mjs';
import { DERIVED_TAGS } from './tags.mjs';

const WEEKDAYS = DAYS.slice(0, 5);
const WEEKEND = DAYS.slice(5);

const has = (r, re) => re.test(r.categories) || re.test(r.name);

// "08:00–17:00" / "11:00–15:00, 17:00–00:00" -> { open, close } w minutach; null gdy zamknięte lub brak danych
function hoursOf(text) {
  const ranges = [...(text ?? '').matchAll(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/g)];
  if (!ranges.length) return null;
  const open = Number(ranges[0][1]) * 60 + Number(ranges[0][2]);
  const last = ranges[ranges.length - 1];
  let close = Number(last[3]) * 60 + Number(last[4]);
  if (close <= open) close += 24 * 60; // po północy
  return { open, close };
}

const RULES = {
  coffee: r => has(r, /kawiarni/i),
  lunch: r => has(r, /restauracj|bistro|bar\b|jadłodajni|kuchnia|ramen|hamburger|pizzeri|obiad/i),
  sweets: r => has(r, /lodziarni|cukierni|ciast/i),
  polish: r => has(r, /kuchnia polska|bar mleczny/i),
  asian: r => has(r, /azjatyck|indyjsk|wietnamsk|ramen|orientaln/i),
  takeaway: r => has(r, /na wynos/i),
  board_games: r => has(r, /planszów/i),
  dog_friendly: r => has(r, /przyjazn\w* dla psów/i),
  early: r => WEEKDAYS.some(d => (hoursOf(r[d])?.open ?? Infinity) <= 8 * 60 + 30),
  late: r => WEEKDAYS.some(d => (hoursOf(r[d])?.close ?? 0) >= 21 * 60),
  weekend: r => WEEKEND.every(d => hoursOf(r[d]) != null),
  top_rated: r => Number(r.rating) >= 4.7,
};

const missing = DERIVED_TAGS.filter(t => !RULES[t]);
if (missing.length) throw new Error(`Brak reguły dla tagów: ${missing.join(', ')}`);

const path = 'data/places.csv';
const rows = parseCsv(readFileSync(path, 'utf8'));
for (const r of rows) {
  const manual = r.tags.split(/\s+/).filter(t => t && !DERIVED_TAGS.includes(t));
  const derived = DERIVED_TAGS.filter(t => RULES[t](r));
  r.tags = [...manual, ...derived].join(' ');
}
writeFileSync(path, toCsv(rows));

const counts = Object.fromEntries(DERIVED_TAGS.map(t => [t, rows.filter(r => r.include === '1' && r.tags.split(' ').includes(t)).length]));
console.log('Lokale (include=1) z tagiem:', counts);
