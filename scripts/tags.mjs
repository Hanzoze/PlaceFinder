// Wszystkie dozwolone tagi. Etykiety do wyświetlania: src/utils/tags.ts (trzymaj w zgodzie).

// Wpisywane ręcznie w CSV (nie da się ich wyliczyć z danych)
export const MANUAL_TAGS = ['wifi', 'sockets', 'quiet', 'laptop_friendly'];

// Wyliczane przez `npm run tags` (scripts/derive-tags.mjs)
export const DERIVED_TAGS = [
  'coffee', 'lunch', 'sweets', 'polish', 'asian', 'takeaway', 'board_games', 'dog_friendly',
  'early', 'late', 'weekend', 'top_rated',
];

export const TAGS = [...MANUAL_TAGS, ...DERIVED_TAGS];
