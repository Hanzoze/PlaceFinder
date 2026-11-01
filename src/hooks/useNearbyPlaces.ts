import { useCallback, useEffect, useState } from 'react';
import { Place } from '../types/place';
import { fetchPlaces } from '../services/places';
import { Coords, getUserLocation, distanceKm } from '../services/geo';

export function useNearbyPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [location, setLocation] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, result] = await Promise.all([getUserLocation(), fetchPlaces()]);
      setLocation(me);
      const withDistance = result
        .map(p => ({ ...p, distanceKm: distanceKm(me, p) }))
        .sort((a, b) => a.distanceKm - b.distanceKm);
      setPlaces(withDistance);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { places, location, loading, error, reload: load };
}
