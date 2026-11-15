import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, busy, error, demo } = useAuth();

  return (
    <View style={styles.container}>
      <Ionicons name="cafe" size={72} color="#3355aa" />
      <Text style={styles.title}>Gdzie na przerwę?</Text>
      <Text style={styles.subtitle}>Kawiarnie i jedzenie blisko kampusu PWr</Text>

      <Pressable
        style={({ pressed }) => [styles.button, (pressed || busy) && styles.buttonPressed]}
        onPress={signIn}
        disabled={busy}
      >
        {busy ? <ActivityIndicator color="#fff" /> : (
          <>
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.buttonText}>{demo ? 'Wejdź (tryb demo)' : 'Zaloguj się przez Google'}</Text>
          </>
        )}
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
      {demo && (
        <Text style={styles.note}>Brak EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID – logowanie Google wyłączone</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8, backgroundColor: '#f4f6fb' },
  title: { fontSize: 26, fontWeight: '700', marginTop: 12 },
  subtitle: { color: '#666', marginBottom: 32, textAlign: 'center' },
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#3355aa', borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28, minWidth: 260,
  },
  buttonPressed: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#c0392b', marginTop: 12, textAlign: 'center' },
  note: { color: '#999', fontSize: 12, marginTop: 24, textAlign: 'center' },
});
