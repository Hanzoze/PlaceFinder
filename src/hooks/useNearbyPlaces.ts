import { useCallback, useEffect, useState } from 'react';
import { Place } from '../types/place';
import { fetchPlaces } from '../services/places';
import { Coords, getUserLocation, distanceKm } from '../services/geo';

async function loadNearby(): Promise<{ location: Coords; places: Place[] }> {
  const [me, result] = await Promise.all([getUserLocation(), fetchPlaces()]);
  const places = result
    .map(p => ({ ...p, distanceKm: distanceKm(me, p) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return { location: me, places };
}

export function useNearbyPlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [location, setLocation] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // setState tylko w callbackach .then/.catch, żeby dało się to wołać w useEffect (react-hooks/set-state-in-effect)
  const fetchAll = useCallback(() =>
    loadNearby()
      .then(r => {
        setLocation(r.location);
        setPlaces(r.places);
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Nieznany błąd'))
      .finally(() => setLoading(false)),
  []);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    return fetchAll();
  }, [fetchAll]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { places, location, loading, error, reload };
}
