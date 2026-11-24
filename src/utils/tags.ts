// Te same tagi sprawdza scripts/seed-places.mjs (lista w scripts/tags.mjs)
export const TAG_LABELS: Record<string, string> = {
  // wpisywane ręcznie w CSV
  wifi: 'Wi-Fi',
  sockets: 'Gniazdka',
  quiet: 'Cicho',
  laptop_friendly: 'Z laptopem',
  // wyliczane przez `npm run tags`
  coffee: 'Kawa',
  lunch: 'Obiad',
  sweets: 'Słodkości',
  polish: 'Kuchnia polska',
  asian: 'Kuchnia azjatycka',
  takeaway: 'Na wynos',
  board_games: 'Planszówki',
  dog_friendly: 'Z psem',
  early: 'Od rana',
  late: 'Do późna',
  weekend: 'Otwarte w weekend',
  top_rated: 'Wysoko oceniane',
};
