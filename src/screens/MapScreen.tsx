import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import PlaceFilterBar, { toggleFilterTag } from '../components/PlaceFilterBar';
import TagFilterSheet from '../components/TagFilterSheet';
import { usePlaces } from '../context/PlacesContext';
import { RootNavigation } from '../navigation/types';
import { PWR_CAMPUS, walkMinutes } from '../services/geo';
import { cardShadow, colors } from '../theme';
import { Place } from '../types/place';
import { activeFilterCount, matchesFilters, NO_FILTERS, PlaceFilters, tagCounts } from '../utils/filters';
import { isOpenNow } from '../utils/workingHours';

// TODO (osoba 2): tryb "między zajęciami"
const DELTA = { latitudeDelta: 0.02, longitudeDelta: 0.02 };

function pinColor(p: Place): string {
  const open = isOpenNow(p.workingHours);
  if (open == null) return colors.primary;
  return open ? colors.open : colors.closed;
}

function markerDescription(p: Place): string {
  if (p.distanceKm == null) return p.address;
  return `${p.distanceKm.toFixed(1)} km · ${walkMinutes(p.distanceKm)} min pieszo`;
}

export default function MapScreen() {
  const { places, loading, error, reload } = usePlaces();
  const navigation = useNavigation<RootNavigation>();
  const [filters, setFilters] = useState<PlaceFilters>(NO_FILTERS);
  const [tagsOpen, setTagsOpen] = useState(false);

  const shown = places.filter(p =>
    Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && matchesFilters(p, filters));
  const activeCount = activeFilterCount(filters);

  return (
    <View style={styles.container}>
      {/* Zawsze startujemy nad kampusem; użytkownik widzi się jako niebieska kropka */}
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...PWR_CAMPUS, ...DELTA }}
        showsUserLocation
      >
        {shown.map(p => (
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

      {/* Filtry pływają nad mapą */}
      <View style={styles.overlay} pointerEvents="box-none">
        <PlaceFilterBar filters={filters} onChange={setFilters} onOpenTags={() => setTagsOpen(true)} />

        {loading && (
          <View style={styles.banner}><ActivityIndicator color={colors.primary} /></View>
        )}
        {error && !loading && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Nie udało się pobrać lokali</Text>
            <Pressable onPress={reload}><Text style={styles.link}>Spróbuj ponownie</Text></Pressable>
          </View>
        )}
        {!loading && !error && activeCount > 0 && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Na mapie: {shown.length}</Text>
            <Pressable onPress={() => setFilters(NO_FILTERS)} hitSlop={8}>
              <Text style={styles.link}>Wyczyść</Text>
            </Pressable>
          </View>
        )}
      </View>

      <TagFilterSheet
        visible={tagsOpen}
        selected={filters.tags}
        counts={tagCounts(places)}
        resultCount={shown.length}
        onToggle={t => setFilters(f => toggleFilterTag(f, t))}
        onClear={() => setFilters(f => ({ ...f, tags: [] }))}
        onClose={() => setTagsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { position: 'absolute', top: 12, left: 0, right: 0, gap: 10 },
  banner: {
    alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, ...cardShadow,
  },
  bannerText: { color: colors.text, fontWeight: '600' },
  link: { color: colors.primary, fontWeight: '700' },
});
