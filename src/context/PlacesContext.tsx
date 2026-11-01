import { createContext, ReactNode, useContext } from 'react';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';

type PlacesState = ReturnType<typeof useNearbyPlaces>;

const PlacesContext = createContext<PlacesState | null>(null);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const value = useNearbyPlaces();
  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>;
}

export function usePlaces(): PlacesState {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error('usePlaces musi być użyty wewnątrz PlacesProvider');
  return ctx;
}
