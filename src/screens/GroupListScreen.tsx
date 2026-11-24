// Moje grupy albo tylko aktywne głosowania (z liczników w Profilu)
import { useLayoutEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GroupRow from '../components/GroupRow';
import { useMyGroups } from '../hooks/useMyGroups';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupList'>;

export default function GroupListScreen({ route, navigation }: Props) {
  const { onlyOpen } = route.params;
  const { groups, loading, error } = useMyGroups();
  const shown = onlyOpen ? groups.filter(g => g.status === 'open') : groups;

  useLayoutEffect(() => {
    navigation.setOptions({ title: onlyOpen ? 'Aktywne głosowania' : 'Moje grupy' });
  }, [navigation, onlyOpen]);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={shown}
      keyExtractor={g => g.id}
      ListHeaderComponent={
        <>
          {loading && <ActivityIndicator color="#3355aa" />}
          {error && <Text style={styles.error}>{error}</Text>}
        </>
      }
      ListEmptyComponent={!loading && !error ? (
        <Text style={styles.empty}>
          {onlyOpen ? 'Nie ma teraz żadnego trwającego głosowania' : 'Nie należysz jeszcze do żadnej grupy'}
        </Text>
      ) : undefined}
      renderItem={({ item }) => <GroupRow group={item} onPress={() => navigation.navigate('Group', { groupId: item.id })} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  error: { color: '#c0392b', textAlign: 'center' },
  empty: { color: '#888', textAlign: 'center', marginTop: 24 },
});
