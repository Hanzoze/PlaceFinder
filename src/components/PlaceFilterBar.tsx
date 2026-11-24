// Przyciski „Otwarte teraz” i „Tagi” (+ wybrane tagi) – wspólne dla Listy i Mapy
import { ScrollView, StyleSheet } from 'react-native';
import { PlaceFilters } from '../utils/filters';
import { TAG_LABELS } from '../utils/tags';
import FilterChip from './FilterChip';

type Props = {
  filters: PlaceFilters;
  onChange: (update: (f: PlaceFilters) => PlaceFilters) => void;
  onOpenTags: () => void;
};

export function toggleFilterTag(f: PlaceFilters, tag: string): PlaceFilters {
  return { ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] };
}

export default function PlaceFilterBar({ filters, onChange, onOpenTags }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
      keyboardShouldPersistTaps="handled"
    >
      <FilterChip
        icon="time-outline"
        label="Otwarte teraz"
        selected={filters.openNow}
        onPress={() => onChange(f => ({ ...f, openNow: !f.openNow }))}
      />
      <FilterChip
        icon="pricetags-outline"
        label={filters.tags.length ? `Tagi · ${filters.tags.length}` : 'Tagi'}
        trailing="chevron-down"
        selected={filters.tags.length > 0}
        onPress={onOpenTags}
      />
      {filters.tags.map(t => (
        <FilterChip
          key={t}
          label={TAG_LABELS[t] ?? t}
          trailing="close"
          selected
          onPress={() => onChange(f => toggleFilterTag(f, t))}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chips: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
});
