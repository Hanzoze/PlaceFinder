import { useLayoutEffect } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { usePlaces } from '../context/PlacesContext';
import { useProfile } from '../hooks/useProfile';
import { RootStackParamList } from '../navigation/types';
import { walkMinutes } from '../services/geo';
import { cardShadow, colors } from '../theme';
import { Place } from '../types/place';
import { confirmRemoveFavorite } from '../utils/confirm';
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
  const { isFavorite, toggleFavorite, error: favoriteError } = useProfile();

  useLayoutEffect(() => {
    if (place) navigation.setOptions({ title: place.name });
  }, [navigation, place]);

  if (!place) {
    return <View style={styles.center}><Text style={styles.muted}>Nie znaleziono lokalu</Text></View>;
  }

  const open = isOpenNow(place.workingHours);
  const favorite = isFavorite(place.id);
  const actions: { label: string; icon: IoniconsIconName; url?: string }[] = [
    { label: 'Zadzwoń', icon: 'call-outline', url: place.phone ? `tel:${place.phone}` : undefined },
    { label: 'Strona', icon: 'globe-outline', url: place.website ? websiteUrl(place.website) : undefined },
    { label: 'Trasa', icon: 'navigate-outline', url: mapsUrl(place) },
  ];
  const onHeart = () => (favorite
    ? confirmRemoveFavorite(place.name, () => toggleFavorite(place.id))
    : toggleFavorite(place.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View>
        {place.photoUrl ? (
          <Image source={{ uri: place.photoUrl }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoEmpty]}>
            <Ionicons name="restaurant-outline" size={48} color="#9fb0d8" />
          </View>
        )}
        <Pressable
          style={styles.heart}
          onPress={onHeart}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={24} color={favorite ? colors.heart : colors.text} />
        </Pressable>
      </View>

      <View style={styles.sheet}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{place.name}</Text>
          {!!place.categories?.length && (
            <Text style={styles.category}>{place.categories.slice(0, 3).join(' · ')}</Text>
          )}
          <View style={styles.badges}>
            {open != null && (
              <View style={[styles.badge, { backgroundColor: open ? colors.open : colors.closed }]}>
                <Text style={styles.badgeText}>{open ? 'Otwarte' : 'Zamknięte'}</Text>
              </View>
            )}
            {place.rating != null && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={15} color={colors.star} />
                <Text style={styles.ratingText}>{place.rating.toFixed(1)}</Text>
                <Text style={styles.muted}>({place.reviewCount ?? 0} opinii)</Text>
              </View>
            )}
          </View>
          {favoriteError && <Text style={styles.error}>{favoriteError}</Text>}
        </View>

        {!!place.tags?.length && (
          <View style={styles.tags}>
            {place.tags.map(t => (
              <Text key={t} style={styles.tag}>{TAG_LABELS[t] ?? t}</Text>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          {actions.map(a => (
            <Pressable
              key={a.label}
              disabled={!a.url}
              onPress={() => a.url && Linking.openURL(a.url).catch(() => {})}
              style={({ pressed }) => [styles.action, !a.url && styles.disabled, pressed && styles.pressed]}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={a.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <InfoRow icon="location-outline" value={place.address || 'brak danych'} />
          <InfoRow icon="wallet-outline" value={formatPrice(place)} />
          {place.distanceKm != null && (
            <InfoRow
              icon="walk-outline"
              value={`${place.distanceKm.toFixed(1)} km · ${walkMinutes(place.distanceKm)} min pieszo`}
            />
          )}
          {open != null && (
            <InfoRow
              icon="time-outline"
              value={`Dziś: ${todayHours(place.workingHours)}`}
              color={open ? colors.open : colors.closed}
            />
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.voteButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('PickGroup', { placeId: place.id })}
        >
          <Ionicons name="people-outline" size={18} color="#fff" />
          <Text style={styles.voteButtonText}>Dodaj do głosowania w grupie</Text>
        </Pressable>

        {place.workingHours && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Godziny otwarcia</Text>
            {weekSchedule(place.workingHours).map(d => (
              <View key={d.day} style={[styles.dayRow, d.isToday && styles.today]}>
                <Text style={[styles.day, d.isToday && styles.bold]}>{d.day}</Text>
                <Text style={[styles.hours, d.isToday && styles.bold]}>{d.hours}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, value, color }: { icon: IoniconsIconName; value: string; color?: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={color ?? colors.textFaint} />
      <Text style={[styles.value, color ? { color, fontWeight: '600' } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted },
  photo: { width: '100%', height: 240 },
  photoEmpty: { backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  heart: {
    position: 'absolute', top: 12, right: 12, width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.95)', ...cardShadow,
  },
  // Biała karta nachodzi na zdjęcie
  sheet: {
    marginTop: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    backgroundColor: colors.background, padding: 16, gap: 14,
  },
  titleBlock: { gap: 6 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text },
  category: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 },
  badge: { borderRadius: 12, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontWeight: '700', color: colors.text },
  error: { color: colors.closed, fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: colors.primarySoft, color: colors.primary, borderRadius: 12, overflow: 'hidden',
    paddingVertical: 4, paddingHorizontal: 10, fontSize: 13, fontWeight: '500',
  },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flex: 1, alignItems: 'center', gap: 6, paddingVertical: 12,
    backgroundColor: colors.surface, borderRadius: 16, ...cardShadow,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  actionText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.8 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 12, ...cardShadow },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  value: { flex: 1, color: colors.text },
  voteButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14,
  },
  voteButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8 },
  today: { backgroundColor: colors.primarySoft },
  day: { color: colors.text, textTransform: 'capitalize' },
  hours: { color: colors.textMuted },
  bold: { fontWeight: '700', color: colors.text },
});
