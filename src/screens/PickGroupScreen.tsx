// Z ekranu Details: do której grupy zaproponować ten lokal
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useMyGroups } from '../hooks/useMyGroups';
import { groupErrorMessage, proposePlace } from '../services/groups';
import { RootStackParamList } from '../navigation/types';
import { Group } from '../types/group';

type Props = NativeStackScreenProps<RootStackParamList, 'PickGroup'>;

export default function PickGroupScreen({ route, navigation }: Props) {
  const { placeId } = route.params;
  const { groups, loading, error } = useMyGroups();
  const [busyId, setBusyId] = useState<string | null>(null);
  const openGroups = groups.filter(g => g.status === 'open');

  const pick = async (group: Group) => {
    setBusyId(group.id);
    try {
      await proposePlace(group, placeId);
      navigation.replace('Group', { groupId: group.id });
    } catch (e) {
      Alert.alert('Nie udało się', groupErrorMessage(e));
      setBusyId(null);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3355aa" /></View>;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={openGroups}
      keyExtractor={g => g.id}
      ListHeaderComponent={error ? <Text style={styles.error}>{error}</Text> : undefined}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>Nie masz grup z otwartym głosowaniem.</Text>
          <Pressable style={styles.button} onPress={() => navigation.navigate('Tabs', { screen: 'Głosowanie' })}>
            <Text style={styles.buttonText}>Utwórz grupę</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => {
        const already = item.placeIds.includes(placeId);
        return (
          <Pressable
            style={[styles.row, already && styles.rowDisabled]}
            disabled={already || busyId !== null}
            onPress={() => pick(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {already ? 'Ten lokal już jest w propozycjach' : `${item.placeIds.length} propozycji · ${item.memberIds.length} os.`}
              </Text>
            </View>
            {busyId === item.id ? <ActivityIndicator color="#3355aa" /> : (
              <Ionicons name={already ? 'checkmark' : 'chevron-forward'} size={22} color={already ? '#999' : '#3355aa'} />
            )}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, gap: 8, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 1 },
  rowDisabled: { opacity: 0.5 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', fontSize: 13 },
  empty: { color: '#888', textAlign: 'center' },
  error: { color: '#c0392b', marginBottom: 8 },
  button: { backgroundColor: '#3355aa', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
