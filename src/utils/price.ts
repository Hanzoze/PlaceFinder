import { Place } from '../types/place';

export function formatPrice(p: Place): string {
  if (p.priceFromPln != null) return `${p.priceFromPln}–${p.priceToPln} zł`;
  if (p.priceLevel) return 'zł'.repeat(['PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE',
    'PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE'].indexOf(p.priceLevel) + 1);
  return 'cena: brak danych';
}
