import { Place } from '../types/place';

export const PLACES: Place[] = [
  {
    id: 'mock-1',
    name: 'Kawiarnia Testowa A',
    address: 'ul. Testowa 1, Wrocław',
    latitude: 51.1085,
    longitude: 17.0605,
    priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
    priceFromPln: 10,
    priceToPln: 20,
    rating: 4.5,
    reviewCount: 120,
    categories: ['Kawiarnia'],
    workingHours: {
      poniedziałek: '08:00–20:00', wtorek: '08:00–20:00', środa: '08:00–20:00',
      czwartek: '08:00–20:00', piątek: '08:00–20:00', sobota: '10:00–18:00', niedziela: 'Zamknięte',
    },
  },
];