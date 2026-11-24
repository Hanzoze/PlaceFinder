// Imię, e-mail i zdjęcie z konta Google; ulubione i „Czego szukam” z Firestore (users/{uid});
// liczniki grup z głosowania. Liczniki i karty prowadzą do pełnych list.
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import { useMyGroups } from '../hooks/useMyGroups';
import { useProfile } from '../hooks/useProfile';
import { RootNavigation } from '../navigation/types';
import { walkMinutes } from '../services/geo';
import { MAX_TAGS } from '../services/profile';
import { cardShadow, colors } from '../theme';
import { TAG_LABELS } from '../utils/tags';

const PREVIEW_COUNT = 3;

function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const { user, logout, busy } = useAuth();
  const { places, loading: placesLoading } = usePlaces();
  const { groups } = useMyGroups();
  const { favoriteIds, preferredTags, loading: profileLoading, error } = useProfile();
  const navigation = useNavigation<RootNavigation>();

  const name = user?.name ?? '';
  // Najnowsze na górze (arrayUnion dopisuje na końcu)
  const favorites = [...favoriteIds]
    .reverse()
    .map(id => places.find(p => p.id === id))
    .filter(p => p != null);

  const stats: { label: string; value: number; icon: IoniconsIconName; open: () => void }[] = [
    { label: 'Ulubione', icon: 'heart', value: favoriteIds.length, open: () => navigation.navigate('Favorites') },
    { label: 'Grupy', icon: 'people', value: groups.length, open: () => navigation.navigate('GroupList', { onlyOpen: false }) },
    {
      label: 'Aktywne głosowania',
      icon: 'thumbs-up',
      value: groups.filter(g => g.status === 'open').length,
      open: () => navigation.navigate('GroupList', { onlyOpen: true }),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(name)}</Text>
          </View>
        )}
        <Text style={styles.name}>{name}</Text>
        {!!user?.email && <Text style={styles.meta}>{user.email}</Text>}
      </View>

      <View style={styles.stats}>
        {stats.map(s => (
          <Pressable
            key={s.label}
            style={({ pressed }) => [styles.stat, pressed && styles.pressed]}
            onPress={s.open}
            accessibilityRole="button"
          >
            <Ionicons name={s.icon} size={18} color={colors.primary} />
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        onPress={() => navigation.navigate('PickTags')}
        accessibilityRole="button"
      >
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Czego szukam</Text>
          <Text style={styles.meta}>{preferredTags.length}/{MAX_TAGS}</Text>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </View>
        {preferredTags.length > 0 ? (
          <View style={styles.tags}>
            {preferredTags.map(t => (
              <Text key={t} style={styles.tag}>{TAG_LABELS[t] ?? t}</Text>
            ))}
          </View>
        ) : (
          <Text style={styles.meta}>Nic nie wybrano – dotknij, żeby wybrać tagi</Text>
        )}
      </Pressable>

      <View style={styles.card}>
        <Pressable style={styles.cardHeader} onPress={() => navigation.navigate('Favorites')} accessibilityRole="button">
          <Text style={styles.sectionTitle}>Ulubione lokale</Text>
          {favorites.length > PREVIEW_COUNT && <Text style={styles.link}>Wszystkie ({favorites.length})</Text>}
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </Pressable>
        {favorites.length === 0 && (
          <Text style={styles.meta}>
            {profileLoading || placesLoading ? 'Wczytywanie…' : 'Brak ulubionych – dodaj je serduszkiem na ekranie lokalu'}
          </Text>
        )}
        {favorites.slice(0, PREVIEW_COUNT).map(p => (
          <Pressable
            key={p.id}
            style={styles.favorite}
            onPress={() => navigation.navigate('Details', { placeId: p.id })}
          >
            <Ionicons name="heart" size={16} color={colors.heart} />
            <Text style={styles.favoriteName} numberOfLines={1}>{p.name}</Text>
            {p.distanceKm != null && (
              <Text style={styles.meta}>{walkMinutes(p.distanceKm)} min</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Pressable style={({ pressed }) => [styles.logout, pressed && styles.pressed]} onPress={logout} disabled={busy}>
        <Ionicons name="log-out-outline" size={18} color={colors.closed} />
        <Text style={styles.logoutText}>Wyloguj się</Text>
      </Pressable>

      {user?.isDemo && <Text style={styles.note}>Tryb demo</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 32 },
  hero: {
    alignItems: 'center', gap: 4, paddingVertical: 20, paddingHorizontal: 16,
    backgroundColor: colors.surface, borderRadius: 20, ...cardShadow,
  },
  avatar: {
    width: 92, height: 92, borderRadius: 46, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    borderWidth: 3, borderColor: colors.primarySoft,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '800', color: colors.text },
  meta: { color: colors.textMuted },
  link: { color: colors.primary, fontWeight: '600' },
  error: { color: colors.closed, textAlign: 'center' },
  pressed: { opacity: 0.8 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 4,
    alignItems: 'center', gap: 2, ...cardShadow,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 14, gap: 10, ...cardShadow },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: colors.primarySoft, color: colors.primary, borderRadius: 12, overflow: 'hidden',
    paddingVertical: 4, paddingHorizontal: 10, fontSize: 13, fontWeight: '500',
  },
  favorite: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider,
  },
  favoriteName: { flex: 1, color: colors.text, fontWeight: '500' },
  logout: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 14, ...cardShadow,
  },
  logoutText: { color: colors.closed, fontWeight: '700' },
  note: { color: colors.textFaint, fontSize: 12, textAlign: 'center' },
});
