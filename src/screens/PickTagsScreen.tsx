// „Czego szukam”: wszystkie dostępne tagi, najwyżej MAX_TAGS; każda zmiana zapisuje się od razu
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useProfile } from '../hooks/useProfile';
import { MAX_TAGS } from '../services/profile';
import { TAG_LABELS } from '../utils/tags';

export default function PickTagsScreen() {
  const { preferredTags, error, toggleTag } = useProfile();
  const full = preferredTags.length >= MAX_TAGS;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={Object.entries(TAG_LABELS)}
      keyExtractor={([tag]) => tag}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.counter}>Wybrano {preferredTags.length} z {MAX_TAGS}</Text>
          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      }
      renderItem={({ item: [tag, label] }) => {
        const selected = preferredTags.includes(tag);
        const disabled = !selected && full;
        return (
          <Pressable
            style={[styles.row, disabled && styles.disabled]}
            onPress={() => toggleTag(tag)}
            disabled={disabled}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected, disabled }}
          >
            <Text style={styles.label}>{label}</Text>
            <Ionicons
              name={selected ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={selected ? '#3355aa' : '#c9d3ea'}
            />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  header: { gap: 4, marginBottom: 4 },
  counter: { color: '#666' },
  error: { color: '#c0392b' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, elevation: 2,
  },
  disabled: { opacity: 0.4 },
  label: { fontSize: 16, color: '#333' },
});
