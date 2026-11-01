import { WorkingHours } from '../types/place';

const DAYS_PL = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const WEEK_PL = [...DAYS_PL.slice(1), DAYS_PL[0]];

export type ScheduleDay = { day: string; hours: string; isToday: boolean };

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function hoursFor(hours: WorkingHours | undefined, day: string): string | undefined {
  if (!hours) return undefined;
  const key = Object.keys(hours).find(k => k.toLowerCase() === day);
  const value = key ? hours[key] : undefined;
  return Array.isArray(value) ? value.join(', ') : value;
}

export function todayHours(hours?: WorkingHours, now = new Date()): string | undefined {
  return hoursFor(hours, DAYS_PL[now.getDay()]);
}

export function weekSchedule(hours?: WorkingHours, now = new Date()): ScheduleDay[] {
  const today = DAYS_PL[now.getDay()];
  return WEEK_PL.map(day => ({ day, hours: hoursFor(hours, day) ?? '—', isToday: day === today }));
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
