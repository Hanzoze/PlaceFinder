import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import PlaceCard from '../components/PlaceCard';
import PlaceFilterBar, { toggleFilterTag } from '../components/PlaceFilterBar';
import TagFilterSheet from '../components/TagFilterSheet';
import { usePlaces } from '../context/PlacesContext';
import { useProfile } from '../hooks/useProfile';
import { RootNavigation } from '../navigation/types';
import {
  activeFilterCount, matchesFilters, NO_FILTERS, PlaceFilters, SortBy, sortPlaces, tagCounts,
} from '../utils/filters';
import { confirmRemoveFavorite } from '../utils/confirm';
import { matchesQuery } from '../utils/search';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'distance', label: 'Najbliżej' },
  { value: 'rating', label: 'Najwyżej oceniane' },
];

export default function ListScreen() {
  const { places, loading, error, reload } = usePlaces();
  const { isFavorite, toggleFavorite } = useProfile();
  const navigation = useNavigation<RootNavigation>();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<PlaceFilters>(NO_FILTERS);
  const [tagsOpen, setTagsOpen] = useState(false);

  if (loading && places.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#3355aa" /></View>;
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

  const filtered = sortPlaces(
    places.filter(p => matchesQuery(p, query) && matchesFilters(p, filters)),
    filters.sortBy,
  );
  const activeCount = activeFilterCount(filters);
  const narrowed = activeCount > 0 || !!query.trim();

  const toggleTag = (tag: string) => setFilters(f => toggleFilterTag(f, tag));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color="#8a96b3" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Wyszukaj po nazwie lub ulicy"
            placeholderTextColor="#8a96b3"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#8a96b3" />
            </Pressable>
          )}
        </View>

        <PlaceFilterBar filters={filters} onChange={setFilters} onOpenTags={() => setTagsOpen(true)} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            onPress={() => navigation.navigate('Details', { placeId: item.id })}
            favorite={isFavorite(item.id)}
            onToggleFavorite={() => (isFavorite(item.id)
              ? confirmRemoveFavorite(item.name, () => toggleFavorite(item.id))
              : toggleFavorite(item.id))}
          />
        )}
        refreshing={loading}
        onRefresh={reload}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.toolbar}>
            <View style={styles.countWrap}>
              <Text style={styles.count}>{narrowed ? `Wyniki: ${filtered.length}` : `${filtered.length} lokali`}</Text>
              {activeCount > 0 && (
                <Pressable onPress={() => setFilters(f => ({ ...NO_FILTERS, sortBy: f.sortBy }))} hitSlop={8}>
                  <Text style={styles.clear}>Wyczyść</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.segment}>
              {SORT_OPTIONS.map(o => {
                const on = filters.sortBy === o.value;
                return (
                  <Pressable
                    key={o.value}
                    style={[styles.segmentItem, on && styles.segmentItemOn]}
                    onPress={() => setFilters(f => ({ ...f, sortBy: o.value }))}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={36} color="#c9d3ea" />
            <Text style={styles.empty}>
              {narrowed ? 'Nic nie pasuje – zmień wyszukiwanie albo filtry' : 'Brak lokali w pobliżu'}
            </Text>
          </View>
        }
      />

      <TagFilterSheet
        visible={tagsOpen}
        selected={filters.tags}
        counts={tagCounts(places)}
        resultCount={filtered.length}
        onToggle={toggleTag}
        onClear={() => setFilters(f => ({ ...f, tags: [] }))}
        onClose={() => setTagsOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  errorDetail: { color: '#999', fontSize: 12, textAlign: 'center', paddingHorizontal: 24 },
  retry: { color: '#3355aa', fontWeight: '600' },

  // Biały pasek z wyszukiwarką i filtrami, na całą szerokość
  header: {
    backgroundColor: '#fff', paddingTop: 12, paddingBottom: 12, gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#dde3f0',
  },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, marginHorizontal: 16,
    paddingHorizontal: 12, backgroundColor: '#f1f4fa', borderRadius: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1d2b4f', paddingVertical: 0 },

  list: { padding: 16, paddingBottom: 32 },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  countWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  count: { color: '#5b6785', fontSize: 13, fontWeight: '600' },
  clear: { color: '#3355aa', fontSize: 13, fontWeight: '600' },
  segment: { flexDirection: 'row', backgroundColor: '#e6ebf5', borderRadius: 10, padding: 2 },
  segmentItem: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8 },
  segmentItemOn: {
    backgroundColor: '#fff', elevation: 1,
    shadowColor: '#1d2b4f', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
  },
  segmentText: { color: '#5b6785', fontSize: 12, fontWeight: '600' },
  segmentTextOn: { color: '#1d2b4f' },

  emptyBox: { alignItems: 'center', gap: 8, marginTop: 40 },
  empty: { color: '#666', textAlign: 'center', paddingHorizontal: 24 },
});
