import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { usePlaces } from '../context/PlacesContext';
import { RootNavigation } from '../navigation/types';
import { PWR_CAMPUS, walkMinutes } from '../services/geo';
import { Place } from '../types/place';
import { isOpenNow } from '../utils/workingHours';

// TODO (osoba 2): tryb "między zajęciami"
const DELTA = { latitudeDelta: 0.02, longitudeDelta: 0.02 };

function pinColor(p: Place): string {
  const open = isOpenNow(p.workingHours);
  if (open == null) return '#3355aa';
  return open ? '#2a8a3e' : '#c0392b';
}

function markerDescription(p: Place): string {
  if (p.distanceKm == null) return p.address;
  return `${p.distanceKm.toFixed(1)} km · ${walkMinutes(p.distanceKm)} min pieszo`;
}

export default function MapScreen() {
  const { places, location, loading, error, reload } = usePlaces();
  const navigation = useNavigation<RootNavigation>();
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (location) mapRef.current?.animateToRegion({ ...location, ...DELTA }, 500);
  }, [location]);

  const withCoords = places.filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...(location ?? PWR_CAMPUS), ...DELTA }}
        showsUserLocation
      >
        {withCoords.map(p => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.name}
            description={markerDescription(p)}
            pinColor={pinColor(p)}
            onCalloutPress={() => navigation.navigate('Details', { placeId: p.id })}
          />
        ))}
      </MapView>

      {loading && (
        <View style={styles.banner}><ActivityIndicator /></View>
      )}
      {error && !loading && (
        <View style={styles.banner}>
          <Text>Nie udało się pobrać lokali</Text>
          <Pressable onPress={reload}><Text style={styles.retry}>Spróbuj ponownie</Text></Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    position: 'absolute', top: 12, alignSelf: 'center', flexDirection: 'row', gap: 8,
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, elevation: 3,
  },
  retry: { color: '#3355aa', fontWeight: '600' },
});
