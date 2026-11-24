import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Place } from '../types/place';
import { isOpenNow, todayHours } from '../utils/workingHours';
import { walkMinutes } from '../services/geo';
import { formatPrice } from '../utils/price';
import { TAG_LABELS } from '../utils/tags';

type Props = {
  place: Place;
  onPress?: () => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;   // bez tego serduszko się nie pokazuje
};

export default function PlaceCard({ place, onPress, favorite, onToggleFavorite }: Props) {
  const open = isOpenNow(place.workingHours);
  const hours = todayHours(place.workingHours);
  const price = place.priceFromPln != null || place.priceLevel ? formatPrice(place) : null;
  const subtitle = [place.categories?.[0], price].filter(Boolean).join(' · ');

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View>
        {place.photoUrl ? (
          <Image source={{ uri: place.photoUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoEmpty]}>
            <Ionicons name="restaurant-outline" size={36} color="#9fb0d8" />
          </View>
        )}
        {open != null && (
          <View style={[styles.pill, styles.pillLeft, open ? styles.pillOpen : styles.pillClosed]}>
            <Text style={styles.pillText}>{open ? 'Otwarte' : 'Zamknięte'}</Text>
          </View>
        )}
        {place.distanceKm != null && (
          <View style={[styles.pill, styles.pillBottom]}>
            <Ionicons name="walk" size={13} color="#333" />
            <Text style={styles.pillDark}>{walkMinutes(place.distanceKm)} min</Text>
          </View>
        )}
        {onToggleFavorite && (
          <Pressable
            style={styles.heart}
            onPress={onToggleFavorite}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
          >
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={20} color={favorite ? '#e0453a' : '#1d2b4f'} />
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
          {place.rating != null && (
            <View style={styles.rating}>
              <Ionicons name="star" size={13} color="#f5a623" />
              <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({place.reviewCount ?? 0})</Text>
            </View>
          )}
        </View>

        {!!subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#888" />
          <Text style={styles.meta} numberOfLines={1}>{place.address}</Text>
        </View>
        {!!hours && (
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.meta} numberOfLines={1}>Dziś: {hours}</Text>
          </View>
        )}

        {!!place.tags?.length && (
          <View style={styles.tags}>
            {place.tags.map(t => (
              <Text key={t} style={styles.tag}>{TAG_LABELS[t] ?? t}</Text>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, overflow: 'hidden',
    elevation: 3, shadowColor: '#1d2b4f', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  pressed: { opacity: 0.85 },
  photo: { width: '100%', height: 150 },
  photoEmpty: { backgroundColor: '#e8eefc', alignItems: 'center', justifyContent: 'center' },
  pill: {
    position: 'absolute', top: 10, flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.92)',
  },
  pillLeft: { left: 10 },
  pillBottom: { top: undefined, bottom: 10, left: 10 },
  heart: {
    position: 'absolute', top: 8, right: 8, width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.95)',
  },
  pillOpen: { backgroundColor: '#2a8a3e' },
  pillClosed: { backgroundColor: '#c0392b' },
  pillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pillDark: { color: '#333', fontSize: 12, fontWeight: '600' },
  body: { padding: 14, gap: 6 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 18, fontWeight: '700', color: '#1d2b4f' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontWeight: '700', color: '#333' },
  reviews: { color: '#999', fontSize: 12 },
  subtitle: { color: '#3355aa', fontSize: 14, fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { flex: 1, color: '#666', fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  tag: {
    backgroundColor: '#e8eefc', color: '#3355aa', borderRadius: 10, overflow: 'hidden',
    paddingVertical: 3, paddingHorizontal: 8, fontSize: 12,
  },
});
