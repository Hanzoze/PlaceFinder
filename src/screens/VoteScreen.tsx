// Lista moich grup + utworzenie nowej / dołączenie po kodzie (także z linku zaproszenia)
import { useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import GroupRow from '../components/GroupRow';
import { useAuth } from '../context/AuthContext';
import { useMyGroups } from '../hooks/useMyGroups';
import { createGroup, groupErrorMessage, joinGroup } from '../services/groups';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Głosowanie'>,
  NativeStackScreenProps<RootStackParamList>
>;

type Mode = 'none' | 'create' | 'join';

export default function VoteScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const { groups, loading, error } = useMyGroups();
  const [mode, setMode] = useState<Mode>('none');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [nick, setNick] = useState(user?.name ?? '');
  const [busy, setBusy] = useState(false);

  // Otwarto link placefinder://join?code=XXX -> od razu formularz dołączenia z kodem
  // Stan ustawiany w trakcie renderu przy nowym kodzie, nie w useEffect (react-hooks/set-state-in-effect)
  const linkCode = route.params?.code;
  const [handledCode, setHandledCode] = useState<string | undefined>();
  if (linkCode && linkCode !== handledCode) {
    setHandledCode(linkCode);
    setCode(linkCode.toUpperCase());
    setMode('join');
  }

  const submit = async () => {
    setBusy(true);
    try {
      const groupId = mode === 'create' ? await createGroup(name, nick) : await joinGroup(code, nick);
      setMode('none');
      setName('');
      setCode('');
      navigation.setParams({ code: undefined });
      navigation.navigate('Group', { groupId });
    } catch (e) {
      Alert.alert('Nie udało się', groupErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const form = mode !== 'none' && (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{mode === 'create' ? 'Nowa grupa' : 'Dołącz do grupy'}</Text>
      {mode === 'create' ? (
        <TextInput style={styles.input} placeholder="Nazwa, np. Obiad po W4" value={name} onChangeText={setName} maxLength={50} />
      ) : (
        <TextInput
          style={[styles.input, styles.codeInput]} placeholder="KOD" value={code} maxLength={8}
          autoCapitalize="characters" autoCorrect={false} onChangeText={t => setCode(t.toUpperCase())}
        />
      )}
      <TextInput style={styles.input} placeholder="Twój nick w grupie" value={nick} onChangeText={setNick} maxLength={30} />
      <View style={styles.row}>
        <Pressable style={[styles.button, styles.secondary]} onPress={() => setMode('none')} disabled={busy}>
          <Text style={styles.secondaryText}>Anuluj</Text>
        </Pressable>
        <Pressable style={[styles.button, busy && styles.disabled]} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.buttonText}>{mode === 'create' ? 'Utwórz' : 'Dołącz'}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            {mode === 'none' && (
              <View style={styles.row}>
                <Pressable style={styles.button} onPress={() => setMode('create')}>
                  <Text style={styles.buttonText}>+ Nowa grupa</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.secondary]} onPress={() => setMode('join')}>
                  <Text style={styles.secondaryText}>Mam kod</Text>
                </Pressable>
              </View>
            )}
            {form}
            <Text style={styles.sectionTitle}>Moje grupy</Text>
            {loading && <ActivityIndicator color="#3355aa" />}
            {error && <Text style={styles.error}>{error}</Text>}
          </View>
        }
        ListEmptyComponent={!loading && !error ? (
          <Text style={styles.empty}>Nie należysz jeszcze do żadnej grupy.{'\n'}Utwórz grupę i wyślij znajomym kod.</Text>
        ) : undefined}
        renderItem={({ item }) => <GroupRow group={item} onPress={() => navigation.navigate('Group', { groupId: item.id })} />}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, gap: 8, paddingBottom: 32 },
  row: { flexDirection: 'row', gap: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#dde3f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  codeInput: { letterSpacing: 4, fontWeight: '700', textAlign: 'center' },
  button: { flex: 1, backgroundColor: '#3355aa', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: { backgroundColor: '#e8eefc' },
  secondaryText: { color: '#3355aa', fontWeight: '600' },
  disabled: { opacity: 0.6 },
  error: { color: '#c0392b' },
  empty: { color: '#888', textAlign: 'center', marginTop: 24, lineHeight: 20 },
});
