# PIM — aplikacja dla studentów (nazwa robocza)

## Uruchomienie
npm install
npx expo start   → zeskanuj QR w Expo Go

## Struktura
src/types      – typy danych (Place)
src/components – komponenty UI
src/screens    – ekrany (1 plik = 1 ekran)
src/navigation – typy nawigacji (taby + stack ze szczegółami)
src/context    – wspólna lista lokali dla Listy, Mapy i Szczegółów
src/services   – Firebase, lokalizacja
data/places.csv – lokale wgrywane do bazy
scripts/       – skrypty do zbierania i wgrywania lokali

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
Każda funkcja w osobnej gałęzi: feature/<nazwa>, merge przez Pull Request.