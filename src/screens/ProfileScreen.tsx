// TODO: prawdziwe konto i ulubione z Firebase, na razie dane z src/mocks/profile.ts
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlaces } from '../context/PlacesContext';
import { MOCK_PROFILE } from '../mocks/profile';
import { RootNavigation } from '../navigation/types';
import { walkMinutes } from '../services/geo';
import { TAG_LABELS } from '../utils/tags';

function initials(name: string): string {
  return name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const profile = MOCK_PROFILE;
  const { places, loading } = usePlaces();
  const navigation = useNavigation<RootNavigation>();

  const favorites = profile.favoritePlaceIds
    .map(id => places.find(p => p.id === id))
    .filter(p => p != null);

  const stats = [
    { label: 'Ulubione', value: profile.favoritePlaceIds.length },
    { label: 'Głosowania', value: profile.votesCount },
    { label: 'Grupy', value: profile.groupsCount },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(profile.name)}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.meta}>{profile.email}</Text>
      </View>

      <View style={styles.stats}>
        {stats.map(s => (
          <View key={s.label} style={styles.stat}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.meta}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Studia</Text>
        <InfoRow label="Uczelnia" value={profile.university} />
        <InfoRow label="Wydział" value={profile.faculty} />
        <InfoRow label="Kierunek" value={profile.fieldOfStudy} />
        <InfoRow label="Rok" value={String(profile.year)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Czego szukam</Text>
        <View style={styles.tags}>
          {profile.preferredTags.map(t => (
            <Text key={t} style={styles.tag}>{TAG_LABELS[t] ?? t}</Text>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ulubione lokale</Text>
        {favorites.length === 0 && (
          <Text style={styles.meta}>{loading ? 'Wczytywanie…' : 'Brak ulubionych'}</Text>
        )}
        {favorites.map(p => (
          <Pressable
            key={p.id}
            style={styles.favorite}
            onPress={() => navigation.navigate('Details', { placeId: p.id })}
          >
            <Text style={styles.favoriteName} numberOfLines={1}>{p.name}</Text>
            {p.distanceKm != null && (
              <Text style={styles.meta}>{walkMinutes(p.distanceKm)} min</Text>
            )}
          </Pressable>
        ))}
      </View>

      <Text style={styles.note}>Dane przykładowe – logowanie jest w przygotowaniu</Text>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  header: { alignItems: 'center', gap: 4, paddingVertical: 8 },
  avatar: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: '#3355aa',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700' },
  meta: { color: '#666' },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#3355aa' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  infoRow: { flexDirection: 'row', gap: 12 },
  label: { width: 80, color: '#999' },
  value: { flex: 1, color: '#333' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#e8eefc', color: '#3355aa', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, fontSize: 13 },
  favorite: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12,
    paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#dde3f0',
  },
  favoriteName: { flex: 1, color: '#333', fontWeight: '500' },
  note: { color: '#999', fontSize: 12, textAlign: 'center' },
});
