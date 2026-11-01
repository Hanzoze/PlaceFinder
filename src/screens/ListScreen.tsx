import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PlaceCard from '../components/PlaceCard';
import { usePlaces } from '../context/PlacesContext';
import { RootNavigation } from '../navigation/types';

export default function ListScreen() {
  const { places, loading, error, reload } = usePlaces();
  const navigation = useNavigation<RootNavigation>();

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

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PlaceCard place={item} onPress={() => navigation.navigate('Details', { placeId: item.id })} />
        )}
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
  errorDetail: { color: '#999', fontSize: 12, textAlign: 'center', paddingHorizontal: 24 },
  retry: { color: '#3355aa', fontWeight: '600' },
});
