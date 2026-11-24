// Okno od dołu z wszystkimi tagami do filtrowania Listy. Zmiany od razu filtrują listę.
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { TAG_LABELS } from '../utils/tags';

type Props = {
  visible: boolean;
  selected: string[];
  counts: Record<string, number>;   // ile lokali ma tag
  resultCount: number;
  onToggle: (tag: string) => void;
  onClear: () => void;
  onClose: () => void;
};

export default function TagFilterSheet({ visible, selected, counts, resultCount, onToggle, onClear, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Zamknij" />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>Tagi</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Zamknij">
            <Ionicons name="close" size={24} color="#666" />
          </Pressable>
        </View>
        <Text style={styles.hint}>Lokal musi mieć wszystkie zaznaczone tagi</Text>

        <ScrollView contentContainerStyle={styles.tags}>
          {Object.entries(TAG_LABELS).map(([tag, label]) => {
            const on = selected.includes(tag);
            return (
              <Pressable
                key={tag}
                style={[styles.tag, on && styles.tagOn]}
                onPress={() => onToggle(tag)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
              >
                {on && <Ionicons name="checkmark" size={14} color="#fff" />}
                <Text style={[styles.tagText, on && styles.tagTextOn]}>{label}</Text>
                <Text style={[styles.tagCount, on && styles.tagTextOn]}>{counts[tag] ?? 0}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={[styles.button, styles.secondary]} onPress={onClear} disabled={selected.length === 0}>
            <Text style={[styles.secondaryText, selected.length === 0 && styles.muted]}>Wyczyść</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Pokaż wyniki ({resultCount})</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,30,60,0.35)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 16, paddingBottom: 32, maxHeight: '75%',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#dde3f0', marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#1d2b4f' },
  hint: { color: '#888', fontSize: 13, marginTop: 2, marginBottom: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 18, backgroundColor: '#f1f4fa', borderWidth: 1, borderColor: '#f1f4fa',
  },
  tagOn: { backgroundColor: '#3355aa', borderColor: '#3355aa' },
  tagText: { color: '#1d2b4f', fontSize: 14, fontWeight: '500' },
  tagTextOn: { color: '#fff' },
  tagCount: { color: '#8a96b3', fontSize: 12 },
  footer: { flexDirection: 'row', gap: 10, marginTop: 12 },
  button: { flex: 2, backgroundColor: '#3355aa', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondary: { flex: 1, backgroundColor: '#e8eefc' },
  secondaryText: { color: '#3355aa', fontWeight: '600' },
  muted: { opacity: 0.4 },
});
