import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons, type IoniconsIconName } from '@react-native-vector-icons/ionicons';
import { colors } from '../theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IoniconsIconName;
  trailing?: IoniconsIconName;
};

export default function FilterChip({ label, selected, onPress, icon, trailing }: Props) {
  const color = selected ? '#fff' : colors.primary;
  return (
    <Pressable
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {icon && <Ionicons name={icon} size={15} color={color} />}
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
      {trailing && <Ionicons name={trailing} size={14} color={color} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.75 },
  text: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  textSelected: { color: '#fff' },
});
