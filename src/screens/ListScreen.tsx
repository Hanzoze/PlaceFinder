import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import PlaceCard from '../components/PlaceCard';
import { usePlaces } from '../context/PlacesContext';
import { RootNavigation } from '../navigation/types';
import { matchesQuery } from '../utils/search';

export default function ListScreen() {
  const { places, loading, error, reload } = usePlaces();
  const navigation = useNavigation<RootNavigation>();
  const [query, setQuery] = useState('');

  if (loading && places.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Nie udało się pobrać lokali</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <Pressable onPress={reload}><Text style={styles.retry}>Spróbuj ponownie</Text></Pressable>
      </View>
    );
  }

  const filtered = places.filter(p => matchesQuery(p, query));

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Wyszukaj po nazwie lub ulicy"
          placeholderTextColor="#999"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PlaceCard place={item} onPress={() => navigation.navigate('Details', { placeId: item.id })} />
        )}
        refreshing={loading}
        onRefresh={reload}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <Text style={styles.empty}>{query.trim() ? `Brak wyników dla „${query.trim()}”` : 'Brak lokali w pobliżu'}</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6fb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  errorDetail: { color: '#999', fontSize: 12, textAlign: 'center', paddingHorizontal: 24 },
  retry: { color: '#3355aa', fontWeight: '600' },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, marginBottom: 12,
    paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 12, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333', paddingVertical: 0 },
  empty: { color: '#666', textAlign: 'center', marginTop: 24 },
});
