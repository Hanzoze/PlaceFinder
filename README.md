# PIM — aplikacja dla studentów (nazwa robocza)

## Uruchomienie (dla nowych osób w zespole)

> **Expo Go już nie wystarczy.** Aplikacja używa modułów natywnych (logowanie Google, `expo-linking`),
> więc działa w **development buildzie** – własnej wersji „Expo Go” z naszymi modułami.
> Build robi się raz; zmiany w JS/TS dochodzą na żywo jak wcześniej.

### Co trzeba mieć
- [Node.js](https://nodejs.org) LTS i [Git](https://git-scm.com)
- Telefon z Androidem (Android Studio **nie jest** potrzebne – budujemy w chmurze EAS)
- Konto Google dopisane do **Test users** (patrz niżej), żeby zalogować się przez Google

### 1. Kod i zależności
```bash
git clone https://github.com/Hanzoze/PlaceFinder_PIM.git
cd PlaceFinder_PIM
npm install
```

### 2. Plik `.env`
Skopiuj `.env.example` jako `.env` i uzupełnij:
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web client ID>
```
Web client ID: konsola Firebase → Security → Authentication → Sign-in method → Google → Web SDK configuration.
Bez tej zmiennej aplikacja startuje w **trybie demo** (przycisk „Wejdź (tryb demo)”, konto anonimowe) – wszystko poza logowaniem Google działa.

### 3. Development build (APK na telefon)
Jeśli ktoś z zespołu zbudował już aktualną wersję – wystarczy link do buildu z expo.dev, nie trzeba budować samemu.
Własny build:
```bash
npm install -g eas-cli
eas login                                            # konto na expo.dev (darmowe)
eas build --profile development --platform android   # 10–20 min
```
Na końcu pojawi się QR / link do `.apk` – otwórz na telefonie i zainstaluj („nieznane źródła” → zezwól).

### 4. Uruchomienie
```bash
npx expo start --dev-client           # telefon i komputer w tej samej sieci Wi-Fi
npx expo start --dev-client --tunnel  # inna sieć / dane komórkowe
```
Na telefonie otwórz aplikację **pim** (nie Expo Go) i zeskanuj QR z terminala albo wpisz adres ręcznie („Enter URL manually”).
Terminal z `expo start` musi być otwarty przez cały czas testowania.

Przy pierwszym uruchomieniu aplikacja poprosi o lokalizację. Bez niej liczy odległości od kampusu PWr.

### Kiedy trzeba zbudować APK od nowa
Tylko gdy zmienia się część natywna:
- nowy pakiet z kodem natywnym (`expo-*`, `react-native-*` instalowane przez `npx expo install`),
- zmiany w `app.json` (np. `scheme`, `plugins`, `android.package`) albo w `google-services.json`.

Objaw starego buildu: czerwony ekran **„Cannot find native module …”**. Zmiany w `src/` nie wymagają buildu.

### Logowanie Google – konfiguracja (robi się raz na projekt)
Już skonfigurowane, opis na wypadek zmian:
- Firebase → Authentication → Sign-in method: włączone **Google** i **Anonymous** (anonimowe – tryb demo i grupy bez logowania).
- Firebase → Project settings → aplikacja Android `pl.pwr.pim` z **SHA-1 keystore'a EAS**
  (`eas credentials -p android` → development). Po zmianie SHA-1 pobierz nowy `google-services.json` do katalogu głównego.
- Google Cloud Console (projekt `pim-pwr`) → Google Auth Platform → Audience: status **Testing**, nasze adresy w **Test users**.
  Kogoś spoza listy Google nie wpuści (`access_denied`).
- `google-services.json` jest w repo celowo (nie jest tajny, a EAS nie wysyła plików z `.gitignore`).
  Web client ID dla buildu w chmurze jest w `eas.json` → `build.development.env`.
- Kto buduje lokalnie (`npx expo run:android`, wymaga Android Studio), musi dopisać w Firebase SHA-1 swojego `debug.keystore`.

### Gdy coś nie działa
| Problem | Rozwiązanie |
|---|---|
| „Cannot find native module …” | Build jest starszy niż kod – zbuduj i zainstaluj APK od nowa |
| Telefon nie łączy się z komputerem | `npx expo start --dev-client --tunnel` albo hotspot z telefonu dla komputera |
| `DEVELOPER_ERROR` przy logowaniu Google | Niezgodny SHA-1 / package albo w `.env` jest Android zamiast **Web** client ID |
| `access_denied` / „aplikacja niezweryfikowana” | Dopisz konto do Test users |
| Przycisk pokazuje „tryb demo” | Brak `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` w `.env` (lokalnie) albo w `eas.json` (build); potem `npx expo start -c` |
| Windows PowerShell: „running scripts is disabled” | Zamiast `npx` pisz `npx.cmd` |
| `npx …` pyta „Ok to proceed? (y)” i się przerywa | Przełącz klawiaturę na angielską – „н” to nie „y” |
| Windows pyta o zaporę dla Node.js | Zezwól w sieciach prywatnych |
| Po `git pull` aplikacja się sypie | `npm install`, `npx expo start --dev-client --clear`; jeśli doszedł pakiet natywny – nowy build |
| Lista pokazuje „Nie udało się pobrać lokali” | Sprawdź internet; szary tekst pod komunikatem mówi, co poszło nie tak |

Dostęp do konsoli Firebase (projekt `pim-pwr`) daje właściciel projektu: Project settings → Users and permissions, rola Editor.

## Struktura
```text
src/types       – typy danych (Place)
src/components  – komponenty UI
src/screens     – ekrany (1 plik = 1 ekran)
src/navigation  – typy nawigacji (logowanie → taby + stack: szczegóły, grupa, wybór lokalu/grupy)
src/context     – AuthContext (zalogowany użytkownik), PlacesContext (wspólna lista lokali)
src/hooks       – useNearbyPlaces, useMyGroups, useGroup
src/services    – Firebase (firebase.ts: app, db, auth), logowanie (auth.ts), grupy, lokalizacja
src/utils       – wyszukiwanie, ceny, godziny, głosy, link zaproszenia
src/mocks       – dane tymczasowe (np. profil), do podmiany na Firebase
data/places.csv – lokale wgrywane do bazy
scripts/        – skrypty do zbierania i wgrywania lokali
```

## Dane (Firebase, projekt pim-pwr)
Lokale są w Firestore, kolekcja `places`. Aplikacja tylko je czyta, nie potrzebuje `.env`.

Źródłem prawdy jest `data/places.csv`: do bazy trafiają wiersze z `include=1`.
Żeby zmienić lokale, tagi albo ceny:
1. Zaimportuj CSV do Google Sheets, popraw, pobierz z powrotem jako CSV.
2. `npm run seed` – wgrywa CSV do bazy (nadpisuje, usuwa lokale bez `include=1`).

Nie edytuj lokali w konsoli Firebase – kolejny seed to nadpisze.
Tagi wpisuj oddzielone spacją: `wifi`, `sockets`, `quiet`, `laptop_friendly`.

Skrypty:
- `npm run seed` – potrzebny klucz admina w `../secrets/placefinder-admin.json` (poza repo, NIE commitować)
- `npm run collect` – ponownie pobiera kandydatów z RapidAPI (`RAPIDAPI_KEY` w `.env`), NADPISUJE CSV
- `npm run deploy:rules` – wgrywa `firestore.rules` (wymaga `npx firebase-tools login`; reguły są wspólne – uprzedź zespół)

## Logowanie
Ekran logowania (`LoginScreen`) → Google przez `@react-native-google-signin` → Firebase Auth (`signInWithCredential`).
Stan w `useAuth()` → `{ user, initializing, busy, error, demo, signIn, logout }`; sesja zostaje po restarcie (AsyncStorage).
Auth inicjalizuje się **tylko** w `src/services/firebase.ts` (drugie `initializeAuth` rzuca błąd).

## Grupy i głosowanie
Ekrany: zakładka **Głosowanie** (moje grupy, nowa grupa, dołącz kodem), `GroupScreen` (propozycje z głosami na żywo,
zaproszenie, zakończenie), `PickPlaceScreen` (zaproponuj lokal), `PickGroupScreen` (z Szczegółów: „Dodaj do głosowania”).
Link `placefinder://join?code=XXX` otwiera zakładkę Głosowanie z wpisanym kodem.

Grupy są przypisane do `uid`: po zalogowaniu Google – konto Google, w trybie demo – anonimowe konto Firebase.
Dane w Firestore: `groups/{id}` (członkowie, propozycje, status), `groups/{id}/votes/{uid}` (jeden głos na osobę),
`invites/{kod}` (kod zaproszenia → grupa). Kto może co, opisują `firestore.rules`.

Hooki (dane na żywo – zmiany innych osób pojawiają się od razu):
- `useMyGroups()` → `{ groups, loading, error }` – moje grupy, najnowsze pierwsze
- `useGroup(groupId)` → `{ group, results, winners, myVote, isOwner, uid, loading, error }`
  - `results` – wszystkie propozycje `{ placeId, count, voterIds }`, od najwięcej głosów
  - `winners` – `placeId` zwycięzców (kilka przy remisie, pusta lista bez głosów)

Akcje (`src/services/groups.ts`, wszystkie async; błąd pokazuj przez `groupErrorMessage(e)`):
| Funkcja | Co robi |
|---|---|
| `createGroup(nazwa, nick)` | nowa grupa, zwraca `groupId`; kod jest w `group.code` |
| `joinGroup(kod, nick)` | dołącza po kodzie (wielkość liter i spacje bez znaczenia), zwraca `groupId` |
| `proposePlace(group, placeId)` | dodaje lokal do propozycji (max 20) |
| `vote(groupId, placeId)` / `removeVote(groupId)` | oddaje, zmienia albo cofa swój głos |
| `closeVoting(groupId)` | tylko twórca; kończy głosowanie, wynik zostaje |

Zaproszenie linkiem (`src/utils/invite.ts`): `inviteMessage(nazwa, kod)` – tekst do `Share.share`,
`codeFromLink(url)` – kod z otwartego linku (`placefinder://join?code=...`, w Expo Go `exp://.../--/join?code=...`).

Wymaga włączonego logowania Google i anonimowego (Authentication → Sign-in method).

## Git
Każda funkcja w osobnej gałęzi `feature/<nazwa>`, merge do `main` przez Pull Request.

```bash
git switch main
git pull                          # najnowszy kod
git switch -c feature/<nazwa>     # nowa gałąź
# ...zmiany...
npm install                       # po pull – nowe zależności
npx tsc --noEmit                  # sprawdzenie typów przed commitem
npm run lint                      # ESLint (npx expo lint)
git add -A
git commit -m "Krótko: co zmieniasz"
git push -u origin feature/<nazwa>
```
Potem na GitHubie: **Compare & pull request** → ktoś z zespołu przegląda → **Merge**.