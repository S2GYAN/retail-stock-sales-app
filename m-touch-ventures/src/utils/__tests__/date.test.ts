import {
  formatDateDisplay,
  formatDateShort,
  formatMonthLabel,
  formatMonthShort,
  fromISO,
  isFutureDate,
  lastNDays,
  toISO,
  todayISO,
} from '../date';

describe('toISO / fromISO', () => {
  it('formats a local date as YYYY-MM-DD with zero padding', () => {
    expect(toISO(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toISO(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('round-trips through fromISO in local time', () => {
    const iso = '2026-08-08';
    expect(toISO(fromISO(iso))).toBe(iso);
  });

  it('parses to local midnight rather than UTC', () => {
    // Parsing as UTC would shift the day in negative offsets.
    const parsed = fromISO('2026-08-08');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(8);
  });
});

describe('formatting helpers', () => {
  it('renders a full display date', () => {
    expect(formatDateDisplay('2026-08-08')).toBe('Sat, 08 Aug 2026');
  });

  it('renders a short day label', () => {
    expect(formatDateShort('2026-08-08')).toBe('08 Aug');
  });

  it('renders month labels from a YYYY-MM string', () => {
    expect(formatMonthLabel('2026-08')).toBe('August 2026');
    expect(formatMonthShort('2026-08')).toBe('Aug 2026');
  });
});

describe('lastNDays', () => {
  it('returns the window ascending, ending on the given day', () => {
    expect(lastNDays(3, '2026-08-08')).toEqual(['2026-08-06', '2026-08-07', '2026-08-08']);
  });

  it('crosses a month boundary', () => {
    expect(lastNDays(3, '2026-08-01')).toEqual(['2026-07-30', '2026-07-31', '2026-08-01']);
  });

  it('crosses a year boundary', () => {
    expect(lastNDays(2, '2026-01-01')).toEqual(['2025-12-31', '2026-01-01']);
  });

  it('handles leap days', () => {
    expect(lastNDays(2, '2028-03-01')).toEqual(['2028-02-29', '2028-03-01']);
  });

  it('returns exactly the requested number of days', () => {
    expect(lastNDays(30, '2026-08-08')).toHaveLength(30);
  });
});

describe('isFutureDate', () => {
  it('rejects tomorrow and accepts today and the past', () => {
    const today = todayISO();
    const tomorrow = lastNDays(1, today)[0];

    expect(isFutureDate(today)).toBe(false);
    expect(isFutureDate(tomorrow)).toBe(false); // same day
    expect(isFutureDate('2999-12-31')).toBe(true);
    expect(isFutureDate('2000-01-01')).toBe(false);
  });
});
