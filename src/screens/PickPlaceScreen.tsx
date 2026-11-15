// Wybór lokalu do zaproponowania w grupie (z wyszukiwarką)
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { usePlaces } from '../context/PlacesContext';
import { useGroup } from '../hooks/useGroup';
import { groupErrorMessage, proposePlace } from '../services/groups';
import { walkMinutes } from '../services/geo';
import { RootStackParamList } from '../navigation/types';
import { matchesQuery } from '../utils/search';

type Props = NativeStackScreenProps<RootStackParamList, 'PickPlace'>;

export default function PickPlaceScreen({ route, navigation }: Props) {
  const { group } = useGroup(route.params.groupId);
  const { places } = usePlaces();
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = places.filter(p => matchesQuery(p, query));

  const pick = async (placeId: string) => {
    if (!group) return;
    setBusyId(placeId);
    try {
      await proposePlace(group, placeId);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Nie udało się', groupErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Szukaj lokalu lub ulicy" value={query} onChangeText={setQuery} />
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => {
          const already = group?.placeIds.includes(item.id) ?? false;
          return (
            <Pressable
              style={[styles.row, already && styles.rowDisabled]}
              disabled={already || busyId !== null}
              onPress={() => pick(item.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {item.distanceKm != null ? `${walkMinutes(item.distanceKm)} min · ` : ''}{item.address}
                </Text>
              </View>
              <Ionicons
                name={already ? 'checkmark' : busyId === item.id ? 'hourglass-outline' : 'add-circle-outline'}
                size={24} color={already ? '#999' : '#3355aa'}
              />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  search: {
    margin: 16, marginBottom: 0, backgroundColor: '#fff', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, elevation: 2,
  },
  content: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 1 },
  rowDisabled: { opacity: 0.5 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { color: '#666', fontSize: 13 },
});
