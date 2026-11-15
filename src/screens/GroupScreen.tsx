// Jedna grupa: propozycje z liczbą głosów na żywo, głosowanie, zaproszenie, zamknięcie przez twórcę
import { useLayoutEffect } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { usePlaces } from '../context/PlacesContext';
import { useGroup } from '../hooks/useGroup';
import { closeVoting, groupErrorMessage, removeVote, vote } from '../services/groups';
import { walkMinutes } from '../services/geo';
import { RootStackParamList } from '../navigation/types';
import { inviteMessage } from '../utils/invite';

type Props = NativeStackScreenProps<RootStackParamList, 'Group'>;

export default function GroupScreen({ route, navigation }: Props) {
  const { groupId } = route.params;
  const { group, results, winners, myVote, isOwner, loading, error } = useGroup(groupId);
  const { places } = usePlaces();

  useLayoutEffect(() => {
    if (group) navigation.setOptions({ title: group.name });
  }, [navigation, group]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#3355aa" /></View>;
  if (error || !group) return <View style={styles.center}><Text style={styles.error}>{error ?? 'Grupa nie istnieje'}</Text></View>;

  const open = group.status === 'open';
  const totalVotes = results.reduce((s, r) => s + r.count, 0);
  const placeName = (id: string) => places.find(p => p.id === id)?.name ?? 'Nieznany lokal';

  const run = (action: () => Promise<void>) => action().catch(e => Alert.alert('Błąd', groupErrorMessage(e)));

  const onVote = (placeId: string) => {
    if (!open) return;
    run(() => (myVote === placeId ? removeVote(groupId) : vote(groupId, placeId)));
  };

  const onClose = () => Alert.alert('Zakończyć głosowanie?', 'Nikt nie będzie mógł już głosować ani proponować.', [
    { text: 'Anuluj', style: 'cancel' },
    { text: 'Zakończ', style: 'destructive', onPress: () => run(() => closeVoting(groupId)) },
  ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Zaproszenie */}
      <View style={styles.card}>
        <Text style={styles.meta}>Kod zaproszenia</Text>
        <View style={styles.codeRow}>
          <Text style={styles.code}>{group.code}</Text>
          <Pressable style={styles.shareButton} onPress={() => Share.share({ message: inviteMessage(group.name, group.code) })}>
            <Ionicons name="share-social" size={18} color="#fff" />
            <Text style={styles.buttonText}>Zaproś</Text>
          </Pressable>
        </View>
        <Text style={styles.meta} numberOfLines={2}>
          Członkowie: {group.memberIds.map(id => group.memberNames[id] ?? '?').join(', ')}
        </Text>
      </View>

      {/* Wynik po zamknięciu */}
      {!open && (
        <View style={[styles.card, styles.winnerCard]}>
          <Ionicons name="trophy" size={28} color="#c99a00" />
          <View style={{ flex: 1 }}>
            <Text style={styles.meta}>Głosowanie zakończone</Text>
            <Text style={styles.winner}>
              {winners.length === 0 ? 'Nikt nie zagłosował' : winners.map(placeName).join(' / ')}
            </Text>
            {winners.length > 1 && <Text style={styles.meta}>Remis</Text>}
          </View>
          {winners.length >= 1 && (
            <Pressable onPress={() => navigation.navigate('Details', { placeId: winners[0] })}>
              <Ionicons name="chevron-forward" size={22} color="#3355aa" />
            </Pressable>
          )}
        </View>
      )}

      {/* Propozycje */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Propozycje ({results.length})</Text>
        <Text style={styles.meta}>głosów: {totalVotes}/{group.memberIds.length}</Text>
      </View>

      {results.length === 0 && (
        <Text style={styles.empty}>Brak propozycji. Dodaj lokal, na który chcesz iść.</Text>
      )}

      {results.map(r => {
        const place = places.find(p => p.id === r.placeId);
        const mine = myVote === r.placeId;
        const leading = winners.includes(r.placeId);
        const share = totalVotes ? r.count / totalVotes : 0;
        return (
          <Pressable
            key={r.placeId}
            style={[styles.option, mine && styles.optionMine]}
            onPress={() => onVote(r.placeId)}
            onLongPress={() => navigation.navigate('Details', { placeId: r.placeId })}
          >
            <View style={[styles.bar, { width: `${share * 100}%` }, leading && styles.barLeading]} />
            <Ionicons
              name={mine ? 'checkmark-circle' : 'ellipse-outline'}
              size={22} color={mine ? '#3355aa' : '#aab'}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.optionName} numberOfLines={1}>{placeName(r.placeId)}</Text>
              <Text style={styles.meta} numberOfLines={1}>
                {place?.distanceKm != null ? `${walkMinutes(place.distanceKm)} min pieszo · ` : ''}
                {r.voterIds.map(id => group.memberNames[id] ?? '?').join(', ') || 'brak głosów'}
              </Text>
            </View>
            <Text style={styles.count}>{r.count}</Text>
          </Pressable>
        );
      })}

      {open && <Text style={styles.hint}>Dotknij, by zagłosować (ponownie – cofnij głos). Przytrzymaj – szczegóły lokalu.</Text>}

      {open && (
        <Pressable
          style={[styles.button, styles.secondary, group.placeIds.length >= 20 && styles.disabled]}
          disabled={group.placeIds.length >= 20}
          onPress={() => navigation.navigate('PickPlace', { groupId })}
        >
          <Text style={styles.secondaryText}>+ Zaproponuj lokal</Text>
        </Pressable>
      )}

      {open && isOwner && (
        <Pressable style={[styles.button, styles.danger]} onPress={onClose}>
          <Text style={styles.buttonText}>Zakończ głosowanie</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6fb' },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, gap: 6, elevation: 2 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  code: { fontSize: 28, fontWeight: '800', letterSpacing: 4, color: '#3355aa' },
  shareButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#3355aa', borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14,
  },
  winnerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff8e1' },
  winner: { fontSize: 18, fontWeight: '700' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 10, overflow: 'hidden',
    backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2,
    borderWidth: 2, borderColor: 'transparent',
  },
  optionMine: { borderColor: '#3355aa' },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#e8eefc' },
  barLeading: { backgroundColor: '#d6e2ff' },
  optionName: { fontSize: 15, fontWeight: '600', color: '#222' },
  count: { fontSize: 18, fontWeight: '700', color: '#3355aa', minWidth: 24, textAlign: 'right' },
  meta: { color: '#666', fontSize: 13 },
  hint: { color: '#999', fontSize: 12, textAlign: 'center' },
  empty: { color: '#888', textAlign: 'center', marginVertical: 12 },
  error: { color: '#c0392b', textAlign: 'center' },
  button: { backgroundColor: '#3355aa', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  secondary: { backgroundColor: '#e8eefc' },
  secondaryText: { color: '#3355aa', fontWeight: '600' },
  danger: { backgroundColor: '#c0392b' },
  disabled: { opacity: 0.5 },
});
