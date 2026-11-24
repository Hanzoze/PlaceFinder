// Wszystkie ulubione lokale; serduszko usuwa po potwierdzeniu
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { usePlaces } from '../context/PlacesContext';
import { useProfile } from '../hooks/useProfile';
import { RootNavigation } from '../navigation/types';
import { walkMinutes } from '../services/geo';
import { confirmRemoveFavorite } from '../utils/confirm';

export default function FavoritesScreen() {
  const { places, loading: placesLoading } = usePlaces();
  const { favoriteIds, loading, error, toggleFavorite } = useProfile();
  const navigation = useNavigation<RootNavigation>();

  // Najnowsze na górze (arrayUnion dopisuje na końcu)
  const favorites = [...favoriteIds]
    .reverse()
    .map(id => places.find(p => p.id === id))
    .filter(p => p != null);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={favorites}
      keyExtractor={p => p.id}
      ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : undefined}
      ListEmptyComponent={
        <Text style={styles.empty}>
          {loading || placesLoading ? 'Wczytywanie…' : 'Brak ulubionych – dodaj je serduszkiem na ekranie lokalu'}
        </Text>
      }
      renderItem={({ item: p }) => (
        <Pressable style={styles.row} onPress={() => navigation.navigate('Details', { placeId: p.id })}>
          {p.photoUrl ? (
            <Image source={{ uri: p.photoUrl }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbEmpty]}>
              <Ionicons name="restaurant-outline" size={22} color="#3355aa" />
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
            <Text style={styles.meta} numberOfLines={1}>{p.address}</Text>
            {p.distanceKm != null && <Text style={styles.meta}>{walkMinutes(p.distanceKm)} min pieszo</Text>}
          </View>
          <Pressable
            onPress={() => confirmRemoveFavorite(p.name, () => toggleFavorite(p.id))}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Usuń ${p.name} z ulubionych`}
          >
            <Ionicons name="heart" size={24} color="#c0392b" />
          </Pressable>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 10, elevation: 2 },
  thumb: { width: 56, height: 56, borderRadius: 10 },
  thumbEmpty: { backgroundColor: '#e8eefc', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', fontSize: 13 },
  error: { color: '#c0392b', textAlign: 'center', marginBottom: 8 },
  empty: { color: '#888', textAlign: 'center', marginTop: 24 },
});
