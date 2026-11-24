// Wspólne kolory i cienie, żeby wszystkie ekrany wyglądały spójnie
export const colors = {
  primary: '#3355aa',
  primarySoft: '#e8eefc',
  text: '#1d2b4f',
  textMuted: '#5b6785',
  textFaint: '#8a96b3',
  border: '#d5ddef',
  divider: '#e6ebf5',
  background: '#f4f6fb',
  surface: '#fff',
  input: '#f1f4fa',
  open: '#2a8a3e',
  closed: '#c0392b',
  heart: '#e0453a',
  star: '#f5a623',
};

// Cień działa na Androidzie (elevation) i na iPhonie (shadow*)
export const cardShadow = {
  elevation: 3,
  shadowColor: colors.text,
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
};
