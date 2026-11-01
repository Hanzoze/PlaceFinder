import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Place } from '../types/place';
import { isOpenNow, todayHours } from '../utils/workingHours';
import { walkMinutes } from '../services/geo';

type Props = { place: Place; onPress?: () => void };

function formatPrice(p: Place): string {
  if (p.priceFromPln != null) return `${p.priceFromPln}–${p.priceToPln} zł`;
  if (p.priceLevel) return 'zł'.repeat(['PRICE_LEVEL_INEXPENSIVE', 'PRICE_LEVEL_MODERATE',
    'PRICE_LEVEL_EXPENSIVE', 'PRICE_LEVEL_VERY_EXPENSIVE'].indexOf(p.priceLevel) + 1);
  return 'cena: brak danych';
}

export default function PlaceCard({ place, onPress }: Props) {
  const open = isOpenNow(place.workingHours);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {place.photoUrl && <Image source={{ uri: place.photoUrl }} style={styles.photo} />}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
        {place.categories?.[0] && <Text style={styles.category}>{place.categories[0]}</Text>}
        <Text style={styles.meta} numberOfLines={1}>{place.address}</Text>

        <View style={styles.row}>
          {place.rating != null && (
            <Text style={styles.meta}>★ {place.rating} ({place.reviewCount ?? 0})</Text>
          )}
          {place.distanceKm != null && (
            <Text style={styles.meta}>
              {place.distanceKm.toFixed(1)} km · {walkMinutes(place.distanceKm)} min
            </Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.meta}>{formatPrice(place)}</Text>
          {open != null && (
            <Text style={[styles.status, { color: open ? '#2a8a3e' : '#c0392b' }]}>
              {open ? 'otwarte' : 'zamknięte'} · {todayHours(place.workingHours)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, elevation: 2, overflow: 'hidden' },
  photo: { width: '100%', height: 140 },
  body: { padding: 12 },
  name: { fontSize: 17, fontWeight: '600' },
  category: { color: '#3355aa', fontSize: 13, marginTop: 2 },
  meta: { color: '#666', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' },
  status: { fontWeight: '600', marginTop: 4 },
});