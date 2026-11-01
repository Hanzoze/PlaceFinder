import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

export const PWR_CAMPUS: Coords = { latitude: 51.1079, longitude: 17.0614 };

export async function getUserLocation(): Promise<Coords> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return PWR_CAMPUS;
  const pos = await Location.getCurrentPositionAsync({});
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function walkMinutes(km: number): number {
  return Math.round(km * 12);
}