// Grupy i głosowanie w Firestore. Reguły dostępu: firestore.rules.
//   groups/{groupId}                – grupa (członkowie, zaproponowane lokale, status)
//   groups/{groupId}/votes/{uid}    – jeden głos na osobę, id dokumentu = uid
//   invites/{code}                  – kod zaproszenia -> groupId
import {
  arrayUnion, collection, deleteDoc, doc, DocumentSnapshot, FirestoreError, getDoc,
  onSnapshot, query, serverTimestamp, setDoc, updateDoc, where, writeBatch,
} from 'firebase/firestore';
import { Group, Vote } from '../types/group';
import { db, ensureSignedIn } from './firebase';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // bez 0/O i 1/I, żeby nie mylić przy przepisywaniu
const CODE_LENGTH = 6;

export class GroupError extends Error {}

function randomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

export function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function cleanText(value: string, field: string, max: number): string {
  const text = value.trim();
  if (!text) throw new GroupError(`${field} nie może być puste`);
  if (text.length > max) throw new GroupError(`${field} może mieć najwyżej ${max} znaków`);
  return text;
}

function toGroup(snap: DocumentSnapshot): Group | null {
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    id: snap.id,
    name: d.name,
    code: d.code,
    createdBy: d.createdBy,
    createdAt: d.createdAt?.toDate() ?? null,
    status: d.status,
    memberIds: d.memberIds ?? [],
    memberNames: d.memberNames ?? {},
    placeIds: d.placeIds ?? [],
  };
}

// Tworzy grupę z twórcą jako jedynym członkiem. Zwraca id grupy.
export async function createGroup(name: string, nickname: string): Promise<string> {
  const groupName = cleanText(name, 'Nazwa grupy', 50);
  const nick = cleanText(nickname, 'Nick', 30);
  const uid = await ensureSignedIn();

  // Kod musi być unikalny: reguły nie pozwalają nadpisać istniejącego zaproszenia, więc przy kolizji losujemy ponownie
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const groupRef = doc(collection(db, 'groups'));
    const batch = writeBatch(db);
    batch.set(groupRef, {
      name: groupName,
      code,
      createdBy: uid,
      createdAt: serverTimestamp(),
      status: 'open',
      memberIds: [uid],
      memberNames: { [uid]: nick },
      placeIds: [],
    });
    batch.set(doc(db, 'invites', code), { groupId: groupRef.id });
    try {
      await batch.commit();
      return groupRef.id;
    } catch (e) {
      const taken = (await getDoc(doc(db, 'invites', code))).exists();
      if (!taken) throw e;
    }
  }
  throw new GroupError('Nie udało się wygenerować kodu, spróbuj ponownie');
}

// Dołącza do grupy po kodzie. Dla osoby, która już jest w grupie, tylko aktualizuje nick. Zwraca id grupy.
export async function joinGroup(code: string, nickname: string): Promise<string> {
  const nick = cleanText(nickname, 'Nick', 30);
  const uid = await ensureSignedIn();

  const invite = await getDoc(doc(db, 'invites', normalizeCode(code)));
  if (!invite.exists()) throw new GroupError('Nie ma grupy z takim kodem');
  const groupId: string = invite.data().groupId;

  try {
    await updateDoc(doc(db, 'groups', groupId), {
      memberIds: arrayUnion(uid),
      [`memberNames.${uid}`]: nick,
    });
  } catch (e) {
    if ((e as FirestoreError).code === 'permission-denied') throw new GroupError('Głosowanie w tej grupie jest już zamknięte');
    throw e;
  }
  return groupId;
}

// Dodaje lokal do propozycji grupy (najwyżej 20). Ponowne dodanie tego samego lokalu nic nie robi.
export async function proposePlace(group: Group, placeId: string): Promise<void> {
  if (group.placeIds.includes(placeId)) return;
  if (group.placeIds.length >= 20) throw new GroupError('Można zaproponować najwyżej 20 lokali');
  await updateDoc(doc(db, 'groups', group.id), { placeIds: arrayUnion(placeId) });
}

// Oddaje albo zmienia głos (jeden na osobę). Lokal musi być wśród propozycji grupy.
export async function vote(groupId: string, placeId: string): Promise<void> {
  const uid = await ensureSignedIn();
  await setDoc(doc(db, 'groups', groupId, 'votes', uid), { placeId, updatedAt: serverTimestamp() });
}

export async function removeVote(groupId: string): Promise<void> {
  const uid = await ensureSignedIn();
  await deleteDoc(doc(db, 'groups', groupId, 'votes', uid));
}

// Tylko twórca. Po zamknięciu nie da się głosować ani proponować, wynik zostaje.
export async function closeVoting(groupId: string): Promise<void> {
  await updateDoc(doc(db, 'groups', groupId), { status: 'closed' });
}

// Subskrypcje w czasie rzeczywistym. Każda zwraca funkcję do odpięcia (wołaj w cleanupie useEffect).

export function subscribeGroup(groupId: string, onChange: (g: Group | null) => void, onError: (e: Error) => void) {
  return onSnapshot(doc(db, 'groups', groupId), snap => onChange(toGroup(snap)), onError);
}

export function subscribeVotes(groupId: string, onChange: (votes: Vote[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    collection(db, 'groups', groupId, 'votes'),
    snap => onChange(snap.docs.map(d => ({ userId: d.id, placeId: d.data().placeId }))),
    onError,
  );
}

export function subscribeMyGroups(uid: string, onChange: (groups: Group[]) => void, onError: (e: Error) => void) {
  return onSnapshot(
    query(collection(db, 'groups'), where('memberIds', 'array-contains', uid)),
    snap => onChange(
      snap.docs
        .map(d => toGroup(d) as Group)
        .sort((a, b) => (b.createdAt?.getTime() ?? Infinity) - (a.createdAt?.getTime() ?? Infinity)),
    ),
    onError,
  );
}

// Komunikat do pokazania w UI
export function groupErrorMessage(e: unknown): string {
  if (e instanceof GroupError) return e.message;
  const code = (e as FirestoreError)?.code;
  if (code === 'permission-denied') return 'Brak dostępu do tej grupy';
  if (code === 'unavailable') return 'Brak połączenia z internetem';
  return e instanceof Error ? e.message : 'Nieznany błąd';
}
