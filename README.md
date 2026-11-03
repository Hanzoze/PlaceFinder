# PIM — aplikacja dla studentów (nazwa robocza)

## Uruchomienie (dla nowych osób w zespole)

### Co trzeba mieć
- [Node.js](https://nodejs.org) w wersji LTS i [Git](https://git-scm.com)
- Telefon z aplikacją **Expo Go** (Google Play / App Store), w tej samej sieci Wi-Fi co komputer

### Pierwsze uruchomienie
```bash
git clone https://github.com/Hanzoze/PlaceFinder_PIM.git
cd PlaceFinder_PIM
npm install
npx expo start
```
Zeskanuj kod QR z terminala: na Androidzie w aplikacji Expo Go, na iPhonie zwykłym aparatem.
Plik `.env` nie jest potrzebny – konfiguracja Firebase jest w repo (`src/services/firebaseConfig.ts`).

Przy pierwszym uruchomieniu aplikacja poprosi o lokalizację. Bez niej liczy odległości od kampusu PWr.

### Gdy coś nie działa
| Problem | Rozwiązanie |
|---|---|
| Windows PowerShell: „running scripts is disabled” | Zamiast `npx` pisz `npx.cmd`, np. `npx.cmd expo start` |
| Telefon nie łączy się z komputerem | `npx expo start --tunnel` (działa też w innej sieci) |
| Windows pyta o zaporę dla Node.js | Zezwól w sieciach prywatnych |
| Expo Go pisze o niezgodnej wersji SDK | Zaktualizuj Expo Go (projekt jest na Expo SDK 58) |
| Po `git pull` aplikacja się sypie | `npm install`, potem `npx expo start --clear` |
| Lista pokazuje „Nie udało się pobrać lokali” | Sprawdź internet; szary tekst pod komunikatem mówi, co poszło nie tak |

Dostęp do konsoli Firebase (projekt `pim-pwr`) daje właściciel projektu: Project settings → Users and permissions, rola Editor.

## Struktura
```text
src/types       – typy danych (Place)
src/components  – komponenty UI
src/screens     – ekrany (1 plik = 1 ekran)
src/navigation  – typy nawigacji (taby + stack ze szczegółami)
src/context     – wspólna lista lokali dla Listy, Mapy i Szczegółów
src/services    – Firebase, lokalizacja
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
- `npm run deploy:rules` – wgrywa `firestore.rules`


## Git
Każda funkcja w osobnej gałęzi `feature/<nazwa>`, merge do `main` przez Pull Request.

```bash
git switch main
git pull                          # najnowszy kod
git switch -c feature/<nazwa>     # nowa gałąź
# ...zmiany...
npx tsc --noEmit                  # sprawdzenie typów przed commitem
npm run lint                      # ESLint (npx expo lint)
git add -A
git commit -m "Krótko: co zmieniasz"
git push -u origin feature/<nazwa>
```
Potem na GitHubie: **Compare & pull request** → ktoś z zespołu przegląda → **Merge**.