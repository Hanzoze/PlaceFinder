// Dane tymczasowe, dopóki nie ma logowania i ulubionych w Firebase

export type Profile = {
  name: string;
  email: string;
  university: string;
  faculty: string;
  fieldOfStudy: string;
  year: number;
  preferredTags: string[];       // klucze z TAG_LABELS
  favoritePlaceIds: string[];    // id z data/places.csv
  votesCount: number;
  groupsCount: number;
};

export const MOCK_PROFILE: Profile = {
  name: 'Student PWr',
  email: 'student@student.pwr.edu.pl',
  university: 'Politechnika Wrocławska',
  faculty: 'Wydział Informatyki i Telekomunikacji',
  fieldOfStudy: 'Informatyka stosowana',
  year: 2,
  preferredTags: ['wifi', 'sockets', 'quiet'],
  favoritePlaceIds: [
    'ChIJ-59eO1DpD0cRVMvJroXpGO0', // Kawiarnia 8m2
    'ChIJ97lJyEbpD0cRQceSWbHXuCw', // Panda Ramen - Grunwald
    'ChIJffGXwyroD0cR5g-Hn1qF6Vg', // Bazylia Bistro
  ],
  votesCount: 3,
  groupsCount: 1,
};
