import { useCallback, useEffect, useState } from 'react';
import { Place } from '../types/place';
import { fetchNearbyPlaces } from '../services/places';
import { getUserLocation, distanceKm } from '../services/geo';

export function useNearbyPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await getUserLocation();
      const result = await fetchNearbyPlaces(me);
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

  return { places, loading, error, reload: load };
}