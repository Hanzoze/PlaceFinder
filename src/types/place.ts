export type PriceLevel =
  | 'PRICE_LEVEL_INEXPENSIVE'
  | 'PRICE_LEVEL_MODERATE'
  | 'PRICE_LEVEL_EXPENSIVE'
  | 'PRICE_LEVEL_VERY_EXPENSIVE';

export type WorkingHours = Record<string, string | string[]>;

export type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  priceLevel?: PriceLevel;
  priceFromPln?: number;
  priceToPln?: number;
  rating?: number;
  reviewCount?: number;
  categories?: string[];      
  workingHours?: WorkingHours;
  photoUrl?: string;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  distanceKm?: number;     
};