import { WorkingHours } from '../types/place';

const DAYS_PL = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

export function todayHours(hours?: WorkingHours, now = new Date()): string | undefined {
  return hours?.[DAYS_PL[now.getDay()]];
}

export function isOpenNow(hours?: WorkingHours, now = new Date()): boolean | undefined {
  const today = todayHours(hours, now);
  if (!today) return undefined;
  if (/zamknięte/i.test(today)) return false;
  if (/całodobowo|24/i.test(today)) return true;

  const current = now.getHours() * 60 + now.getMinutes();
  return today.split(',').some(range => {
    const [start, end] = range.split(/[–-]/).map(s => s.trim());
    if (!start || !end) return false;
    const s = toMinutes(start);
    let e = toMinutes(end);
    if (e <= s) e += 24 * 60;         
    return current >= s && current < e;
  });
}