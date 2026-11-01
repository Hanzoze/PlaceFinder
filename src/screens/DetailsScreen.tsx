import { useLayoutEffect } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { usePlaces } from '../context/PlacesContext';
import { RootStackParamList } from '../navigation/types';
import { walkMinutes } from '../services/geo';
import { Place } from '../types/place';
import { formatPrice } from '../utils/price';
import { TAG_LABELS } from '../utils/tags';
import { isOpenNow, todayHours, weekSchedule } from '../utils/workingHours';

type Props = NativeStackScreenProps<RootStackParamList, 'Details'>;

function websiteUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

function mapsUrl(p: Place): string {
  return p.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`;
}

export default function DetailsScreen({ route, navigation }: Props) {
  const { places } = usePlaces();
  const place = places.find(p => p.id === route.params.placeId);

  useLayoutEffect(() => {
    if (place) navigation.setOptions({ title: place.name });
  }, [navigation, place]);

  if (!place) {
    return <View style={styles.center}><Text>Nie znaleziono lokalu</Text></View>;
  }

  const open = isOpenNow(place.workingHours);
  const actions = [
    { label: 'Zadzwoń', url: place.phone ? `tel:${place.phone}` : undefined },
    { label: 'Strona', url: place.website ? websiteUrl(place.website) : undefined },
    { label: 'Mapa', url: mapsUrl(place) },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {place.photoUrl ? (
        <Image source={{ uri: place.photoUrl }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.photoEmpty]}>
          <Text style={styles.meta}>{place.categories?.[0] ?? 'Brak zdjęcia'}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.name}>{place.name}</Text>
        {!!place.categories?.length && (
          <Text style={styles.category}>{place.categories.slice(0, 3).join(' · ')}</Text>
        )}
        {place.rating != null && (
          <Text style={styles.rating}>★ {place.rating} <Text style={styles.meta}>(opinie: {place.reviewCount ?? 0})</Text></Text>
        )}
        {!!place.tags?.length && (
          <View style={styles.tags}>
            {place.tags.map(t => (
              <Text key={t} style={styles.tag}>{TAG_LABELS[t] ?? t}</Text>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <InfoRow label="Adres" value={place.address || 'brak danych'} />
          <InfoRow label="Cena" value={formatPrice(place)} />
          {place.distanceKm != null && (
            <InfoRow
              label="Odległość"
              value={`${place.distanceKm.toFixed(1)} km · ${walkMinutes(place.distanceKm)} min pieszo`}
            />
          )}
          {open != null && (
            <InfoRow
              label="Teraz"
              value={`${open ? 'otwarte' : 'zamknięte'} · ${todayHours(place.workingHours)}`}
              color={open ? '#2a8a3e' : '#c0392b'}
            />
          )}
        </View>

        <View style={styles.actions}>
          {actions.map(a => (
            <Pressable
              key={a.label}
              disabled={!a.url}
              onPress={() => a.url && Linking.openURL(a.url).catch(() => {})}
              style={[styles.action, !a.url && styles.actionDisabled]}
            >
              <Text style={styles.actionText}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {place.workingHours && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Godziny otwarcia</Text>
            {weekSchedule(place.workingHours).map(d => (
              <View key={d.day} style={[styles.dayRow, d.isToday && styles.today]}>
                <Text style={[styles.day, d.isToday && styles.bold]}>{d.day}</Text>
                <Text style={[styles.meta, d.isToday && styles.bold]}>{d.hours}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, color ? { color, fontWeight: '600' } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: 220 },
  photoEmpty: { backgroundColor: '#dde3f0', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 12 },
  name: { fontSize: 22, fontWeight: '700' },
  category: { color: '#3355aa', fontSize: 14, marginTop: -8 },
  rating: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#e8eefc', color: '#3355aa', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 8, elevation: 2 },
  infoRow: { flexDirection: 'row', gap: 12 },
  label: { width: 80, color: '#999' },
  value: { flex: 1, color: '#333' },
  actions: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, backgroundColor: '#3355aa', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  actionDisabled: { opacity: 0.35 },
  actionText: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6 },
  today: { backgroundColor: '#e8eefc' },
  day: { color: '#333', textTransform: 'capitalize' },
  bold: { fontWeight: '700', color: '#222' },
});
