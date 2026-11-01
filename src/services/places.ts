import { collection, getDocs } from 'firebase/firestore';
import { Place } from '../types/place';
import { db } from './firebase';

// Lokale wgrywa `npm run seed` z data/places.csv
export async function fetchPlaces(): Promise<Place[]> {
  const snap = await getDocs(collection(db, 'places'));
  return snap.docs.map(d => ({ ...(d.data() as Omit<Place, 'id'>), id: d.id }));
}
