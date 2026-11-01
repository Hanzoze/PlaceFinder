import { View, Text, StyleSheet } from 'react-native';

// TODO (osoba 2): mapa z markerami + tryb "między zajęciami"
export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text>Budowa</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});