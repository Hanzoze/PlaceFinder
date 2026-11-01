import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import PlaceCard from '../components/PlaceCard';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';

export default function ListScreen() {
  const { places, loading, error, reload } = useNearbyPlaces();

  if (loading && places.length === 0) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Nie udało się pobrać lokali</Text>
        <Pressable onPress={reload}><Text style={styles.retry}>Spróbuj ponownie</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PlaceCard place={item} />}
        refreshing={loading}
        onRefresh={reload}
        ListEmptyComponent={<Text>Brak lokali w pobliżu</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6fb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  retry: { color: '#3355aa', fontWeight: '600' },
});