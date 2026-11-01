export const DAYS = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];

export const COLUMNS = [
  'include', 'id', 'name', 'address', 'latitude', 'longitude', 'distance_m',
  'rating', 'review_count', 'price_from_pln', 'price_to_pln', 'tags', 'categories',
  'phone', 'website', 'maps_url', 'photo_url', ...DAYS, 'source_query',
];

function escape(value) {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// BOM na początku, żeby Excel/Google Sheets poprawnie pokazały polskie znaki.
export function toCsv(rows) {
  const lines = [COLUMNS.join(','), ...rows.map(r => COLUMNS.map(c => escape(r[c])).join(','))];
  return '﻿' + lines.join('\n') + '\n';
}

export function parseCsv(text) {
  const records = [];
  let row = [], field = '', quoted = false;
  text = text.replace(/^﻿/, '');

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f !== '')) records.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some(f => f !== '')) records.push(row);

  const [header, ...data] = records;
  return data.map(r => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}
