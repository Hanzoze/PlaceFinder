import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Group } from '../types/group';

export default function GroupRow({ group, onPress }: { group: Group; onPress: () => void }) {
  const open = group.status === 'open';
  return (
    <Pressable style={styles.groupRow} onPress={onPress}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.groupName} numberOfLines={1}>{group.name}</Text>
        <Text style={styles.meta}>
          {group.memberIds.length} os. · {group.placeIds.length} propozycji · kod {group.code}
        </Text>
      </View>
      <Text style={[styles.badge, open ? styles.badgeOpen : styles.badgeClosed]}>{open ? 'trwa' : 'zakończone'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  groupRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2,
  },
  groupName: { fontSize: 16, fontWeight: '600' },
  meta: { color: '#666', fontSize: 13 },
  badge: { fontSize: 12, fontWeight: '600', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, overflow: 'hidden' },
  badgeOpen: { backgroundColor: '#e3f6e8', color: '#1e8a3c' },
  badgeClosed: { backgroundColor: '#eee', color: '#777' },
});
