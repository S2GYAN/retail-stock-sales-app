const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Today's date as YYYY-MM-DD, in local time. */
export function todayISO(): string {
  return toISO(new Date());
}

/** Converts a local Date to YYYY-MM-DD. */
export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Parses a YYYY-MM-DD string into a local Date (midnight local time). */
export function fromISO(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/** e.g. "Sat, 08 Aug 2026" */
export function formatDateDisplay(iso: string): string {
  const date = fromISO(iso);
  return `${WEEKDAY_SHORT[date.getDay()]}, ${pad2(date.getDate())} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** e.g. "08 Aug" */
export function formatDateShort(iso: string): string {
  const date = fromISO(iso);
  return `${pad2(date.getDate())} ${MONTH_SHORT[date.getMonth()]}`;
}

/** e.g. "August 2026" for a YYYY-MM string. */
export function formatMonthLabel(monthIso: string): string {
  const [year, month] = monthIso.split('-').map(Number);
  return `${MONTH_NAMES[(month || 1) - 1]} ${year}`;
}

/** e.g. "Aug 2026" for a YYYY-MM string. */
export function formatMonthShort(monthIso: string): string {
  const [year, month] = monthIso.split('-').map(Number);
  return `${MONTH_SHORT[(month || 1) - 1]} ${year}`;
}

/** Current calendar month as YYYY-MM. */
export function currentMonthISO(): string {
  return todayISO().slice(0, 7);
}

/** Returns an array of YYYY-MM-DD strings for the last `count` days, ending today (inclusive), ascending order. */
export function lastNDays(count: number, endISO: string = todayISO()): string[] {
  const end = fromISO(endISO);
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    days.push(toISO(d));
  }
  return days;
}

/** True if `iso` is strictly after today's local date. */
export function isFutureDate(iso: string): boolean {
  return iso > todayISO();
}
